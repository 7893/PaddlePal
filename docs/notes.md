# PaddlePal 项目演进与架构决策日志 (Work Notes & ADR)

本文档记录 PaddlePal 项目的历史检查记录、重大重构里程碑与架构决策日志 (Architecture Decision Records)。

---

## 演进里程碑记录

### 2026-08-12：项目架构 5A 化与系统依赖/安全全面升级
1. **系统环境与依赖升级**：
   - 将 `package.json` 中的 Node.js 基线升级至 `>=24.18.1`，pnpm 基线升级至 `>=11.19.0`。
   - `package.json` 补充 `"type": "module"`，消除 ESLint 解析告警。
   - 重构 pnpm 11 配置，将 `overrides` 和 `onlyBuiltDependencies` 声明升至根级别。
   - 将核心开发依赖 `wrangler` 升级至最新正式版 `^4.121.0`（更新 `miniflare` 5.x 与 `workerd` 1.x 运行时）。
   - 在 `overrides` 中增加 `undici` (>=7.29.0) 与 `nanoid` (^3.3.18) 版本覆盖，实现 `pnpm audit` **0 漏洞 (No known vulnerabilities found)**。
2. **文档结构 5A 化重构**：
   - 整合 `docs/user-roles.md`、`docs/api.md` 与 `docs/sszs-analysis.md` 成为集中统一的 `docs/architecture.md`（涵盖 BA/AA/DA/TA/SA 5 大架构维度）。
   - 将 Markdown 文本表格全量重构成原生 GFM 管道表格，确保多端 100% 垂直对齐。
   - 新增 `docs/ops.md`（运维部署与容灾恢复手册）与 `docs/notes.md`（演进日志）。
3. **测试门禁验证**：
   - 55 个 Vitest 单元测试、TypeScript 类型检查与 ESLint 全量通过。

---

### 2026-04-09：项目常规检查与依赖维护
- **依赖维护**：修复依赖安全漏洞（`flatted` 3.4.2 等）。
- **项目结构确认**：
  - `src/` — 主代码（routes、views、components、utils、do）
  - `sql/` — 数据库 schema + seed 数据
  - `tests/` — 单元测试（scoring、types、validate、middleware）
  - `resources/` — 导入模板、记分单模板
  - `references/` — 漳浦县庆元宵乒乓球赛秩序册参考资料
  - `docs/` — 架构文档与运维手册

---

### 2026-04-01：项目初期检查
1. **定位项目**：确认 `/home/ubuntu/PaddlePal` 为乒乓球项目。
2. **Git 状态检查**：main 分支，工作区干净，与远程同步。
3. **开发环境**：部署于 Cloudflare Workers，选用 Hono + JSX + TypeScript + D1 + KV + R2。

---

## 常用命令速查

```bash
pnpm install            # 安装依赖
pnpm dev                # 本地开发
pnpm test               # 运行单元测试
pnpm run check          # 类型检查 + lint + 单元测试 (门禁)
pnpm run deploy         # 部署到 Cloudflare Workers
pnpm run db:init:local  # 初始化本地数据库
```
