# Technical

## 1. 技术栈

- 游戏：Last Train
- 类型：other
- 简述：V1「末班车」—— 凌晨 3:47 你坐在空荡的末班地铁, 对面是个雨夜淋湿的女人。点 5 处 (线路图/车窗/对座的她/车门/身旁空座), 每处一段视频 + 独白, 从暧昧 (玻璃里她的倒影在看你) 滑向不对劲 (每站都是这站、门从没开过、她坐到了你身边)。末班车进站, 门开向同一节车厢:『这是你的站, 一直都是』。粉紫超现实, 约 40s。
- 框架 / 语言 / 构建：React, TypeScript, Vite, Less
- 渲染方式：DOM/CSS
- 依赖摘录：@types/react@^18.2.0, @types/react-dom@^18.2.0, @vitejs/plugin-react@^4.2.1, less@^4.2.0, react@^18.2.0, react-dom@^18.2.0, typescript@^5.3.3, vite@^5.1.0
- 平台元信息：meta.title=Last Train；cover_url=/poster.png；category=other；uuid=17a76a17-4b27-4666-b264-0982116f6012

## 2. 目录结构

- `index.html`：Vite/浏览器入口，挂载根节点和基础 meta。
- `package.json`：定义 npm 脚本、依赖和工程名称。
- `vite.config.ts`：配置构建、插件和相对路径 base。
- `meta.json`：平台发布元信息，包含标题和封面。
- `src/App.tsx`：React 组件和交互界面。
- `src/main.tsx`：React 组件和交互界面。
- `src/index.less`：视觉样式、布局、动画和响应式规则。
- `src/vite-env.d.ts`：游戏源码模块。
- `src/game-id.ts`：游戏源码模块。
- `src/Game/Game.tsx`：React 组件和交互界面。
- `src/Game/i18n.ts`：中英文或多语言文案。
- `src/Game/Game.less`：视觉样式、布局、动画和响应式规则。

关键源码模块：

- `src/App.tsx`
- `src/main.tsx`
- `src/index.less`
- `src/vite-env.d.ts`
- `src/game-id.ts`
- `src/Game/Game.tsx`
- `src/Game/i18n.ts`
- `src/Game/Game.less`

## 3. 核心模块

- 状态管理与节奏：通过 React 状态与定时器处理倒计时、阶段推进或生成节奏。
- 渲染方式：DOM/CSS，样式由 CSS/Less 和组件结构共同完成。
- 碰撞 / 更新：源码包含命中、距离、边界或重叠判断，结果会影响得分、生命或阶段。
- 音频：未发现独立音频模块，当前以视觉和文案反馈为主。
- 多语言：包含 i18n / locale 检测或 `t()` 文案函数。
- 存储：使用 localStorage、useGameSave 或 persist 保存分数、收藏、墙数据或本地状态。
- Aigram 运行时：接入 `@shared/runtime` 或平台桥接能力，用于用户、资料页、分享、通知或平台 API。

## 4. 扩展点

- 改玩法参数：优先查找 `src/` 内大写常量、hooks、主组件顶部配置或关卡数组。
- 换素材：替换 `public/`、`src/img/` 或源码 import 的图片/音频文件，并保持相对路径。
- 调视觉：修改主样式文件中的颜色、间距、动画时长、网格尺寸和响应式规则。
- 改文案：修改 i18n 字典、组件内标题按钮文案，保持 zh/en 同步。
- 加平台能力：在已有 `@shared/runtime`、useGameSave、排行榜、墙或通知调用附近扩展，避免另起一套存储。
