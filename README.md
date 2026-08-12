# 🏓 拍档 PaddlePal

[![Deploy to Cloudflare Workers](https://img.shields.io/badge/Deploy-Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare)](https://paddlepal.53.workers.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Hono](https://img.shields.io/badge/Hono-4.12.34-E36002?style=for-the-badge)](https://hono.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D24.18.1-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D11.19.0-F69220?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

轻量级乒乓球赛事管理系统，基于 Cloudflare Workers 构建，提供极速响应和实时比分同步体验。

**在线体验**: https://paddlepal.53.workers.dev

---

## 📚 项目 5A 架构与运维文档导航

- 📘 [**1. 业务架构 (Business Architecture, BA)**](docs/1-ba-business.md) — 业务现状/SSZS分析、目标流程、权限矩阵、同分计算与异常处理规则
- 📗 [**2. 应用架构 (Application Architecture, AA)**](docs/2-aa-application.md) — 模块划分、视图路由、全量 API 契约与 WebSocket 实时 Payload 规范
- 📙 [**3. 数据架构 (Data Architecture, DA)**](docs/3-da-data.md) — 13 表字段级数据字典、索引设计、KV Session、R2 存储与 DO 内存模型
- 📕 [**4. 技术架构 (Technical Architecture, TA)**](docs/4-ta-tech.md) — 技术选型、Cloudflare 边缘绑定、离线/弱网容错与 CI/CD 自动化门禁
- 📓 [**5. 安全架构 (Security Architecture, SA)**](docs/5-sa-security.md) — Session 认证、RBAC 越权防护、WAF/DDoS 防护、比分录入幂等性与审计日志
- 🛠️ [**运维部署与灾备恢复手册 (Operations Manual)**](docs/ops.md) — 本地开发、环境部署、数据库初始化与比赛现场 Checkpoint 恢复
- 📝 [**项目演进与架构决策日志 (Work Notes & ADR)**](docs/notes.md) — 演进历史、重构记录与架构决策日志

---

## 🏗 架构与数据流 (Architecture & Data Flow)

```mermaid
graph TD
    %% Client Roles
    Public[👤 公众用户/观众]
    Umpire[👮‍♂️ 裁判员/工作人员]
    
    %% Edge Network
    subgraph Cloudflare Edge [🌩️ Cloudflare Edge Network]
        Worker[⚙️ Workers (Hono Router + JSX UI)]
        
        %% State & Storage
        DO[(⚡ Durable Objects\n实时 WebSocket)]
        KV[(🔑 KV\nSession & Auth)]
        D1[(💾 D1 SQLite\n核心业务数据)]
        R2[(🖼️ R2\n静态资产 & 图片)]
    end
    
    %% Connections
    Public -. 实时订阅大屏比分 (WSS) .-> DO
    Public -- 浏览签表/成绩 (HTTPS GET) --> Worker
    Umpire -- 录入现场比分 (HTTPS POST) --> Worker
    
    Worker -- 触发比分更新广播 --> DO
    Worker -- JWT鉴权/限流/Session --> KV
    Worker -- 强一致性事务读取/持久化 --> D1
    Worker -- 读写头像/队旗文件 --> R2
    
    classDef cf fill:#f48120,stroke:#fff,stroke-width:2px,color:#fff;
    class Worker,DO,KV,D1,R2 cf;
```

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
├── 1-ba-business.md  # 业务架构 (BA)
├── 2-aa-application.md # 应用架构 (AA)
├── 3-da-data.md      # 数据架构 (DA)
├── 4-ta-tech.md      # 技术架构 (TA)
├── 5-sa-security.md  # 安全架构 (SA)
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
