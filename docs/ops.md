# PaddlePal 运维、部署与灾备恢复手册 (Operations & Recovery Manual)

本文档提供 PaddlePal（拍档）系统的环境依赖、部署步骤、数据库初始化、本地门禁检查以及比赛现场数据检查点（Checkpoint）故障恢复指南。

---

## 一、 环境与依赖要求

| 工具/组件 | 依赖版本 | 说明 |
| :--- | :--- | :--- |
| **Node.js** | `>=24.18.1` | 开发与部署必须满足的运行时版本 |
| **pnpm** | `>=11.19.0` | 推荐使用的依赖包管理器 |
| **Wrangler** | `>=4.121.0` | Cloudflare CLI 部署与调试工具 |

---

## 二、 本地开发与测试

### 1. 安装项目依赖
```bash
pnpm install
```

### 2. 初始化本地 D1 数据库
```bash
pnpm run db:init:local
```

### 3. 启动本地开发服务 (Wrangler Dev)
```bash
pnpm dev
```
访问本地服务地址：`http://localhost:8787`

### 4. 执行本地门禁检查 (Quality Gate Check)
在提交代码或向主分支合并前，必须依次跑通格式化与门禁校验：
```bash
pnpm run format         # 自动格式化代码 (Prettier)
pnpm run check          # 全量门禁校验 (包含 typecheck + lint + 55个 Vitest 单元测试)
```

---

## 三、 生产环境部署与配置 (Cloudflare Workers)

### 1. 登录 Cloudflare 账号
```bash
pnpm wrangler login
```

### 2. 生产环境 D1 数据库初始化
> ⚠️ **高危提醒**：生产环境数据库初始化涉及建表操作，请确保严格按照 SRE Plan -> Review -> Execute 流程授权后执行。
```bash
pnpm run db:init
```

### 3. 部署生产应用
```bash
pnpm run deploy
```
部署完成后，可以通过控制台返回的默认域名（如 `https://paddlepal.53.workers.dev`）访问上线系统。

---

## 四、 比赛现场数据检查点与故障回滚指南 (Checkpoint Recovery)

为防止现场裁判或编排人员在关键节点（如抽签、阶段切换）录入错误导致赛程无法继续，系统在数据库设计中支持按节点恢复：

### 关键阶段备份点建议：
1. **Checkpoint 00**：初始化数据库后 (Init)
2. **Checkpoint 01**：导入赛事规则与参赛方案后 (Import Scheme)
3. **Checkpoint 02**：导入参赛选手/队伍名单与抽签完成后 (Draw Complete)
4. **Checkpoint 03**：生成完各阶段赛程表后 (Schedule Complete)
5. **Checkpoint 04**：正式比赛开始前快照 (Pre-Match Backup)

### 故障恢复操作：
如现场发生重大误操作且无法通过裁判长后台解锁修改时：
1. 使用 Wrangler D1 命令导出或恢复特定 checkpoint 备份数据。
2. 重启现场球台 Durable Objects（`DO`）组件，清空当前内存中的错乱实时比分锁状态，使系统恢复至上一个安全节点。
