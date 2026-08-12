# 🏓 拍档 PaddlePal

轻量级乒乓球赛事管理系统，基于 Cloudflare Workers 构建。

**在线体验**: https://paddlepal.53.workers.dev

---

## 📚 项目核心文档

- 📘 [**5A 综合架构设计蓝图 (Architecture Blueprint)**](docs/architecture.md) — 涵盖业务架构 (BA)、应用架构 (AA)、数据架构 (DA)、技术架构 (TA) 与安全架构 (SA)
- 🛠️ [**运维部署与灾备恢复手册 (Operations Manual)**](docs/ops.md) — 本地开发、环境部署、数据库初始化与比赛现场 Checkpoint 恢复
- 📝 [**项目演进与架构决策日志 (Work Notes & ADR)**](docs/notes.md) — 演进历史、重构记录与架构决策日志

---

## ✨ 功能特性

### 赛事管理
- 创建和配置赛事（名称、地点、日期、球台数）
- 支持多种比赛项目（单打、双打、团体）
- 支持淘汰赛和循环赛赛制
- 自动生成对阵签表

### 选手与队伍
- 选手信息管理（姓名、性别、积分）
- 队伍管理与队旗上传
- CSV 批量导入导出

### 比赛进程
- 实时比分录入与快捷数字格式解析
- 检录与球台分配、调场控制
- 比赛进度追踪与申诉处理
- 现场比分锁与确认机制

### 信息展示
- 实时比分大屏（适合体育馆投影）
- 赛程公告滚动屏
- 成绩查询与排名
- 选手积分排行榜

### 用户角色
- **裁判长 (Referee)**：完整管理与确认/解锁权限
- **副裁判长 (Deputy Referee)**：辅助赛事管理与轮值权限
- **编排长 (Scheduler)**：赛程编排与抽签权限
- **记录员 (Recorder)**：检录、控场与调场（球台/时间）权限
- **裁判员 (Umpire)**：分配赛台的现场比分录入权限
- **公众 (Public)**：免登录查看公开比分与成绩

---

## 🛠 技术栈

- **运行时 (Runtime)**: Cloudflare Workers (Node.js >=24.18.1 / ES Module)
- **Web 框架 (Framework)**: Hono + JSX (^4.12.34)
- **数据库 (Database)**: Cloudflare D1 (SQLite)
- **实时协同 (Realtime)**: Cloudflare Durable Objects (DO) + WebSocket
- **文件存储 (Storage)**: Cloudflare R2
- **会话存储 (Session)**: Cloudflare KV
- **语言 (Language)**: TypeScript (^5.9.3 严格模式)
- **包管理器 (Package)**: pnpm (>=11.19.0)

---

## 📦 项目结构

```
src/
├── index.ts          # 应用入口 (Hono Router)
├── middleware.ts     # 认证与 RBAC 中间件
├── scoring.ts        # 比分计算与算法逻辑
├── types.ts          # TypeScript 全量类型定义
├── utils.ts          # 独立工具函数
├── validate.ts       # 输入数据校验逻辑
├── components/       # UI 组件
├── routes/           # RESTful API & 页面路由
└── views/            # 前端页面视图
docs/
├── architecture.md   # 5A 综合架构设计蓝图 (BA/AA/DA/TA/SA)
├── ops.md            # 运维部署与灾备恢复手册
└── notes.md          # 演进日志与架构决策 (ADR)
sql/
├── schema.sql        # 数据库结构 (13 张表 Schema)
└── seed.sql          # 测试初始数据
tests/                # Vitest 单元测试 (55 个测试用例)
```

---

## 🚀 快速开始

### 环境要求
- Node.js >=24.18.1
- pnpm >=11.19.0
- Wrangler CLI >=4.121.0

### 安装依赖
```bash
pnpm install
```

### 本地开发与数据库初始化
```bash
pnpm run db:init:local # 初始化本地 D1 数据库
pnpm dev               # 启动本地开发服务 (http://localhost:8787)
```

### 运行单元测试
```bash
pnpm test             # 运行 Vitest 单元测试
```

### 全量门禁检查
```bash
pnpm run check        # 执行全量门禁检查 (Typecheck + Lint + Vitest)
```

### 部署到生产环境
```bash
pnpm run deploy       # 部署到 Cloudflare Workers
```

---

## ⚙️ Cloudflare 资源配置 (`wrangler.toml`)

```toml
name = "paddlepal"
main = "src/index.ts"
compatibility_date = "2026-07-01"

[[d1_databases]]
binding = "DB"
database_name = "paddlepal-db"

[[kv_namespaces]]
binding = "SESSIONS"

[[r2_buckets]]
binding = "FILES"
bucket_name = "paddlepal-files"

[durable_objects]
bindings = [{ name = "DO", class_name = "DO" }]
```

---

## 📊 数据模型概览 (13 张表)

| 表名 (Table) | 说明 (Description) |
| :--- | :--- |
| `tournaments` | 赛事表 |
| `events` | 比赛项目表 |
| `teams` | 队伍表 |
| `players` | 选手表 |
| `matches` | 比赛场次表 |
| `scores` | 局分记录表 |
| `group_tables` | 循环赛分组表 |
| `group_entries` | 分组成绩表 |
| `brackets` | 淘汰赛对阵表 |
| `draws` | 抽签记录表 |
| `notices` | 赛事公告表 |
| `referees` | 裁判与工作人员表 |
| `ratings` | 积分变动表 |

---

## 📄 许可

MIT
