import { useCallback, useEffect, useRef, useState } from 'react';
import { t } from './i18n';
import './Game.less';

type ClipId = string;
type Phase =
  | 'idle'
  | 'playing'
  | 'holdingSubtitle'
  | 'climaxReady'
  | 'climaxPlaying'
  | 'revelation'
  | 'done';

type AffordanceKind = 'ripple';

interface Clip {
  id: ClipId;
  // hotspot bounding box (% of container)
  top: number;
  left: number;
  width: number;
  height: number;
  labelKey: string;
  video: string;
  endFrame: string;
  subtitleKey: string | null;
  affordance: AffordanceKind;
  affordanceX?: number;
  affordanceY?: number;
}

const CLIPS: Clip[] = [
  { id: 'map',    top: 3,  left: 4,  width: 52, height: 12,
    labelKey: 'hotspot.map',    video: 'clip_01_map.mp4',
    endFrame: 'end_01_map.png',    subtitleKey: 'sub.map',
    affordance: 'ripple', affordanceX: 50, affordanceY: 50 },
  { id: 'window', top: 30, left: 0,  width: 20, height: 28,
    labelKey: 'hotspot.window', video: 'clip_02_window.mp4',
    endFrame: 'end_02_window.png', subtitleKey: 'sub.window',
    affordance: 'ripple', affordanceX: 60, affordanceY: 50 },
  { id: 'her',    top: 36, left: 48, width: 34, height: 48,
    labelKey: 'hotspot.her',    video: 'clip_03_her.mp4',
    endFrame: 'end_03_her.png',    subtitleKey: 'sub.her',
    affordance: 'ripple', affordanceX: 45, affordanceY: 40 },
  { id: 'doors',  top: 22, left: 82, width: 18, height: 46,
    labelKey: 'hotspot.doors',  video: 'clip_04_doors.mp4',
    endFrame: 'end_04_doors.png',  subtitleKey: 'sub.doors',
    affordance: 'ripple', affordanceX: 35, affordanceY: 50 },
  { id: 'seat',   top: 60, left: 0,  width: 46, height: 38,
    labelKey: 'hotspot.seat',   video: 'clip_05_seat.mp4',
    endFrame: 'end_05_seat.png',   subtitleKey: 'sub.seat',
    affordance: 'ripple', affordanceX: 55, affordanceY: 40 },
];

const CLIMAX_VIDEO = 'clip_06_climax_arrive.mp4';
const CLIMAX_END_FRAME = 'end_06_climax_arrive.png';

const SUBTITLE_DELAY_MS = 900;     // when in clip to fade in
const HOLD_AFTER_END_MS = 2400;    // hold the last frame + subtitle, includes the fade window
const VIDEO_FADE_MS = 900;         // cross-fade window inside HOLD_AFTER_END_MS — softens video → hero cut
const CLIMAX_SUBTITLE_DELAY_MS = 4400;
const REVELATION_HOLD_MS = 4500;

const videoUrl = (name: string) => `${import.meta.env.BASE_URL}videos/${name}`;
const frameUrl = (name: string) => `${import.meta.env.BASE_URL}frames/${name}`;

export default function Game() {
  const [taps, setTaps] = useState<Set<ClipId>>(new Set());
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentClip, setCurrentClip] = useState<Clip | null>(null);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [videoFallback, setVideoFallback] = useState(false); // true if <video> failed
  const [videoExiting, setVideoExiting] = useState(false); // triggers cross-fade to hero
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const subtitleTimerRef = useRef<number | null>(null);
  const holdTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);

  const debug = typeof window !== 'undefined' && window.location.search.includes('debug');

  const clearTimers = () => {
    if (subtitleTimerRef.current) {
      window.clearTimeout(subtitleTimerRef.current);
      subtitleTimerRef.current = null;
    }
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (fadeTimerRef.current) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
  };

  const playClip = useCallback(
    (clip: Clip) => {
      if (phase !== 'idle') return;
      clearTimers();
      setCurrentClip(clip);
      setVideoFallback(false);
      setVideoExiting(false);
      setSubtitleVisible(false);
      setPhase('playing');
      subtitleTimerRef.current = window.setTimeout(() => {
        if (clip.subtitleKey) setSubtitleVisible(true);
      }, SUBTITLE_DELAY_MS);
    },
    [phase],
  );

  const onClipEnded = useCallback(() => {
    if (!currentClip) return;
    setPhase('holdingSubtitle');
    if (currentClip.subtitleKey) setSubtitleVisible(true);

    // Phase 1: hold last frame + subtitle for (HOLD_AFTER_END_MS - VIDEO_FADE_MS).
    // Phase 2: fade video out over VIDEO_FADE_MS — hero gradually revealed.
    // Phase 3: unmount video + advance state.
    fadeTimerRef.current = window.setTimeout(() => {
      setVideoExiting(true);
      setSubtitleVisible(false);
    }, HOLD_AFTER_END_MS - VIDEO_FADE_MS);

    holdTimerRef.current = window.setTimeout(() => {
      const next = new Set(taps);
      const wasFirstView = !next.has(currentClip.id);
      next.add(currentClip.id);
      setTaps(next);
      setCurrentClip(null);
      setVideoExiting(false);
      if (wasFirstView && next.size === CLIPS.length) {
        window.setTimeout(() => setPhase('climaxReady'), 800);
      } else {
        setPhase('idle');
      }
    }, HOLD_AFTER_END_MS);
  }, [currentClip, taps]);

  const playClimax = useCallback(() => {
    if (phase !== 'climaxReady') return;
    clearTimers();
    setPhase('climaxPlaying');
    setSubtitleVisible(false);
    subtitleTimerRef.current = window.setTimeout(() => {
      setSubtitleVisible(true);
    }, CLIMAX_SUBTITLE_DELAY_MS);
  }, [phase]);

  const onClimaxEnded = useCallback(() => {
    setPhase('revelation');
    setSubtitleVisible(true);
    holdTimerRef.current = window.setTimeout(() => {
      setPhase('done');
    }, REVELATION_HOLD_MS);
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    setTaps(new Set());
    setCurrentClip(null);
    setSubtitleVisible(false);
    setVideoFallback(false);
    setPhase('idle');
  }, []);

  useEffect(() => () => clearTimers(), []);

  // determine what's currently being shown over the hero
  const showingClimaxVideo = phase === 'climaxPlaying' || phase === 'revelation';
  const showingClipVideo = (phase === 'playing' || phase === 'holdingSubtitle') && currentClip != null;

  const activeVideoUrl = showingClipVideo && currentClip
    ? videoUrl(currentClip.video)
    : showingClimaxVideo
      ? videoUrl(CLIMAX_VIDEO)
      : null;

  const activeFallbackFrame = videoFallback && showingClipVideo && currentClip
    ? frameUrl(currentClip.endFrame)
    : videoFallback && showingClimaxVideo
      ? frameUrl(CLIMAX_END_FRAME)
      : null;

  const activeSubtitle =
    subtitleVisible && currentClip?.subtitleKey
      ? t(currentClip.subtitleKey)
      : subtitleVisible && (phase === 'climaxPlaying' || phase === 'revelation')
        ? t('sub.climax')
        : null;

  // simulated end for fallback (no real video element)
  useEffect(() => {
    if (!videoFallback) return;
    if (phase === 'playing' || phase === 'holdingSubtitle') {
      const t = window.setTimeout(onClipEnded, 3200);
      return () => window.clearTimeout(t);
    }
    if (phase === 'climaxPlaying') {
      const t = window.setTimeout(onClimaxEnded, 5500);
      return () => window.clearTimeout(t);
    }
  }, [videoFallback, phase, onClipEnded, onClimaxEnded]);

  return (
    <div className="lc">
      <div className="lc-stage">
        <img
          src={import.meta.env.BASE_URL + 'hero.png'}
          alt=""
          className="lc-hero"
          draggable={false}
        />

        {/* Video overlay — poster = hero kills the black flash during buffering */}
        {activeVideoUrl && !videoFallback && (
          <video
            ref={videoRef}
            key={activeVideoUrl}
            src={activeVideoUrl}
            poster={import.meta.env.BASE_URL + 'hero.png'}
            className={`lc-video ${videoExiting ? 'is-exiting' : ''}`}
            playsInline
            autoPlay
            preload="auto"
            onEnded={phase === 'climaxPlaying' ? onClimaxEnded : onClipEnded}
            onError={() => setVideoFallback(true)}
          />
        )}

        {/* Fallback: end-frame image when video unavailable */}
        {activeFallbackFrame && (
          <img
            src={activeFallbackFrame}
            alt=""
            className="lc-video lc-video--fallback"
            draggable={false}
          />
        )}

        {/* Title card + tap hint — visible before first tap, retire after. */}
        {phase === 'idle' && taps.size === 0 && (
          <>
            <div className="lc-title">
              <div className="lc-title__overline">
                <span>// the train that doesn't stop</span>
              </div>
              <div className="lc-title__main">LAST&nbsp;TRAIN</div>
              <div className="lc-title__sub">[&nbsp; LINE 7 &nbsp;//&nbsp; 03:47 &nbsp;//&nbsp; LAST SERVICE &nbsp;]</div>
            </div>
            <div className="lc-firsthint">{t('hint.firstTap')}</div>
          </>
        )}

        {/* Hotspots + affordances (idle only). Tapped hotspots stay clickable but are visually dimmed. */}
        {phase === 'idle' &&
          CLIPS.map((c) => {
            const seen = taps.has(c.id);
            return (
              <div
                key={c.id}
                className={`lc-hot-group ${debug ? 'is-debug' : ''}`}
                style={{
                  top: `${c.top}%`,
                  left: `${c.left}%`,
                  width: `${c.width}%`,
                  height: `${c.height}%`,
                }}
              >
                <div
                  className={`lc-ripple ${seen ? 'is-seen' : ''}`}
                  style={{
                    left: `${c.affordanceX ?? 50}%`,
                    top: `${c.affordanceY ?? 50}%`,
                  }}
                >
                  <i />
                </div>
                <button
                  type="button"
                  className="lc-hot"
                  aria-label={t(c.labelKey)}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    playClip(c);
                  }}
                />
              </div>
            );
          })}

        {/* Climax cue */}
        {phase === 'climaxReady' && (
          <button
            type="button"
            className="lc-cue"
            onPointerDown={playClimax}
            aria-label={t('hotspot.showtime')}
          >
            <span>Showtime</span>
          </button>
        )}

        {/* Subtitle */}
        {activeSubtitle && (
          <div className="lc-subtitle" key={activeSubtitle}>
            {activeSubtitle}
          </div>
        )}

        {/* After-revelation reset button */}
        {phase === 'done' && (
          <div className="lc-after">
            <button
              type="button"
              className="lc-btn"
              onPointerDown={(e) => {
                e.stopPropagation();
                reset();
              }}
            >
              {t('btn.onceMore')}
            </button>
          </div>
        )}
      </div>

      {/* Progress strip */}
      <div className="lc-strip">
        {CLIPS.map((c) => (
          <div
            key={c.id}
            className={`lc-strip__seg ${taps.has(c.id) ? 'is-lit' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
