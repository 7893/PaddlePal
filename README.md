# 🏓 拍档 PaddlePal

轻量级乒乓球赛事管理系统，基于 Cloudflare Workers 构建。

**在线体验**: https://paddlepal.53.workers.dev

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
- 实时比分录入
- 检录与球台分配
- 比赛进度追踪
- 申诉处理

### 信息展示
- 实时比分大屏（适合投影）
- 赛程公告滚动屏
- 成绩查询与排名
- 积分排行榜

### 用户角色
- 裁判长：完整管理权限
- 副裁判长：赛事管理权限
- 编排长：赛程编排权限
- 记录员：比分录入权限
- 裁判员：基础查看权限

## 🛠 技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono + JSX
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **会话**: Cloudflare KV
- **语言**: TypeScript

## 📦 项目结构

```
src/
├── index.ts          # 应用入口
├── middleware.ts     # 认证中间件
├── scoring.ts        # 比分计算
├── types.ts          # 类型定义
├── utils.ts          # 工具函数
├── validate.ts       # 数据验证
├── components/       # UI 组件
│   ├── layout.tsx    # 布局组件
│   └── match.tsx     # 比赛组件
├── routes/           # API 路由
│   ├── pages.tsx     # 页面路由
│   ├── admin-api.ts  # 管理 API
│   ├── draw-api.ts   # 抽签 API
│   └── ...
└── views/            # 页面视图
    ├── home.tsx
    ├── live.tsx
    └── ...
sql/
├── schema.sql        # 数据库结构
└── seed.sql          # 测试数据
tests/                # 单元测试
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Wrangler CLI

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
```

### 运行测试
```bash
npm test              # 运行测试
npm run test:coverage # 覆盖率报告
```

### 代码检查
```bash
npm run typecheck     # 类型检查
npm run lint          # ESLint
npm run format        # Prettier 格式化
npm run check         # 全部检查
```

### 部署
```bash
npm run deploy
```

## ⚙️ Cloudflare 资源配置

```toml
# wrangler.toml
name = "paddlepal"

[[d1_databases]]
binding = "DB"
database_name = "paddlepal-db"

[[kv_namespaces]]
binding = "SESSIONS"

[[r2_buckets]]
binding = "FILES"
bucket_name = "paddlepal-files"
```

## 📊 数据模型

| 表名 | 说明 |
|------|------|
| tournaments | 赛事 |
| events | 比赛项目 |
| teams | 队伍 |
| players | 选手 |
| matches | 比赛场次 |
| scores | 比分记录 |
| group_tables | 循环赛分组 |
| group_entries | 分组成绩 |
| brackets | 淘汰赛对阵 |
| draws | 抽签记录 |
| notices | 公告 |
| referees | 裁判 |
| ratings | 积分变动 |

## 🔧 开发工具

- **Husky**: Git hooks
- **lint-staged**: 提交前检查
- **Vitest**: 单元测试
- **Prettier**: 代码格式化
- **ESLint**: 代码规范

## 📝 API 概览

### 公开接口
- `GET /api/live` - 实时比赛
- `GET /api/schedule` - 赛程安排
- `GET /api/rankings` - 排名榜

### 管理接口 (需认证)
- `POST /api/matches/:id/score` - 录入比分
- `POST /api/draw/:eventId` - 执行抽签
- `POST /api/checkin/:matchId` - 检录
- `GET /api/export/:type` - 数据导出

## 📄 许可

MIT
