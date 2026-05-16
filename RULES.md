# 🏓 PaddlePal Agentic Rules (Harness Engineering)

本文档是 `PaddlePal`（乒乓球赛事管理系统）的绝对工程红线。
所有在此项目中运行的 AI Agent（无论是 `sa`, `se` 还是 `pe`）都必须强制读取并严格遵守。

## 一、 技术栈与架构铁律 (Architecture Red Lines)
1. **运行环境**：本项目基于 **Cloudflare Workers** 构建。绝对禁止引入任何依赖 Node.js 原生 API（如 `fs`, `path`, `child_process`）的包。
2. **核心框架**：后端路由渲染强制使用 **Hono + JSX**。禁止引入 Express、Koa 或其他 Web 框架。
3. **数据存储绑定**：
   - 关系型数据：使用 **Cloudflare D1** (SQLite)，环境变量绑定为 `env.DB`。
   - 状态/会话：使用 **Cloudflare KV**，环境变量绑定为 `env.SESSIONS`。
   - 文件/图片：使用 **Cloudflare R2**，环境变量绑定为 `env.FILES`。
   - 实时协同：使用 **Durable Objects**，类名为 `DO`。
4. **类型安全**：本项目为严谨的 TypeScript 工程。**绝对禁止**使用 `any`、`@ts-ignore` 或 `@ts-expect-error`。所有数据库查询必须有明确的返回类型接口。

## 二、 角色行为边界 (Sub Agent Boundaries)

### 1. 软件架构师 (sa)
- **核心职能**：读取现有路由 (`src/routes/`)、数据结构 (`sql/schema.sql`)，并输出 Markdown 格式的系统设计或重构方案。
- **不可逾越的红线**：**绝对禁止**使用命令行修改、新建或覆盖任何 `.ts`, `.tsx`, `.sql` 文件。你只负责产出设计文档（存放在 `docs/` 或根目录）。

### 2. 软件工程师 (se)
- **核心职能**：严格依据 `sa` 的设计文档编写业务逻辑代码和单元测试。
- **强制自闭环门禁 (Scripts)**：
  在完成代码编写后，**绝不允许**直接向人类汇报“完成”。你必须自己在终端依次或联合执行以下门禁命令：
  1. `pnpm run format` (格式化代码)
  2. `pnpm run check` (涵盖 `typecheck`, `lint`, `test`)
  - **报错自驱修复**：如果上述任何命令抛出 Error（Exit Code 非 0），你必须自己去阅读报错日志，分析原因，修改代码，并再次运行。
  - **交付标准**：只有当你亲眼在终端看到所有测试（Vitest）和检查全部 `PASS` 后，才能带着绿色的日志向人类交差。

### 3. 运维/SRE (pe)
- **核心职能**：负责环境部署 (`wrangler deploy`)、本地数据库重置 (`pnpm run db:init:local`)、测试数据灌入等基础设施操作。
- **项目高危定义补充**：根据你的全局 SRE 防爆职业红线（Plan -> Review -> Execute），在本项目中，任何**不带 `--local` 参数**的 `wrangler` 命令（如涉及生产环境 D1, KV, R2 增删改），均属于绝对高危操作，必须严格触发授权拦截。

## 三、 代码提交约定 (Git Hooks)
本项目配置了 `husky` 和 `lint-staged`。任何不符合 Eslint 规范或导致 Vitest 测试失败的代码，都无法通过 `git commit`。因此，`se` 角色必须在本地跑通 `pnpm run check`，否则你的提交将被无情拒绝。
