# 📗 PaddlePal 应用架构蓝图 (Application Architecture, AA)

本文档定义 PaddlePal（拍档）乒乓球赛事管理系统的 **应用架构 (AA)**，涵盖应用模块划分、组件与页面路由结构、全量 API 契约及 WebSocket 实时通信 Payload 规范。

---

## 一、 核心应用模块划分

```
src/
├── index.ts          # 应用入口 (Hono Router 调度)
├── middleware.ts     # 认证与 RBAC 权限中间件
├── scoring.ts        # 比分计算与胜负判定逻辑
├── types.ts          # TypeScript 全量类型定义
├── utils.ts          # 独立工具函数与辅助组件
├── validate.ts       # 输入数据校验与格式化
├── do/               # Durable Objects 实时协同模块
├── components/       # JSX UI 视图组件 (Layout, Match, Scoreboard, etc.)
├── routes/           # RESTful API & 页面路由处理
└── views/            # 前端页面视图 (Home, Live, Admin, Schedule, etc.)
```

---

## 二、 页面组件化与渲染结构 (JSX SSR)

应用采用 **Hono JSX 服务端渲染 (SSR)** 配合轻量交互 Hydration：

1. **`components/layout.tsx`**：通用 HTML 页面骨架、NavBar 导航栏、Toast 消息通知与通用样式加载。
2. **`components/match.tsx`**：单场比赛比分卡片、裁判录分控制面板与状态 Badge。
3. **`views/live.tsx`**：体育馆投影大屏视图，高对比度字体、自动轮播与 WebSocket 实时刷新机制。
4. **`views/admin.tsx`**：赛事管理后台综合控制面板，具备赛事编辑、选手导入、抽签调度与导出面板。

---

## 三、 完整 API 接口契约 (API Reference)

### 1. 鉴权说明
大部分管理接口需要通过 Session Cookie 进行身份验证。登录接口位于 `POST /login`。

### 2. 公开接口 (Public Endpoints)
- `GET /api/live` - 获取当前正在进行的比赛比分及状态。
- `GET /api/schedule` - 获取赛程安排。支持查询参数 `date` (YYYY-MM-DD) 与 `table` (球台号)。
- `GET /api/rankings` - 获取选手积分与排名榜。支持查询参数 `event_id`。
- `GET /api/search?q={query}` - 按选手姓名模糊搜索比赛历史。

### 3. 比赛管理接口 (Match Management)
- `POST /api/matches/:id/score` - 录入/更新比赛比分（需 `recorder` 及以上权限）。
  ```json
  { "scores": [[11, 9], [11, 7], [9, 11], [11, 5]] }
  ```
- `POST /api/checkin/:matchId` - 选手检录与球台分配（需 `scheduler` 及以上权限）。
  ```json
  { "table_no": 3 }
  ```
- `POST /api/confirm/:matchId` - 确认并锁定比赛成绩（需 `referee` 权限）。

### 4. 抽签与对阵接口 (Draw & Bracket)
- `POST /api/draw/:eventId` - 执行抽签（支持 `random` 或 `seeded` 算法，需 `scheduler` 及以上权限）。
- `GET /api/bracket/:eventId` - 获取淘汰赛树状图结构。

### 5. 赛事管理后台接口 (Admin Endpoints)
- `GET /api/admin/tournaments` - 赛事列表。
- `POST /api/admin/tournaments` - 创建赛事（名称、地点、日期、球台数）。
- `PUT /api/admin/tournaments/:id` - 更新赛事配置。
- `DELETE /api/admin/tournaments/:id` - 删除赛事。
- `GET /api/admin/events` - 项目列表（如男单、女单、双打）。
- `POST /api/admin/events` - 创建项目（赛制、局数 `best_of`）。
- `GET /api/admin/players` - 选手列表。
- `POST /api/admin/players` - 新增选手。
- `POST /api/import/players` - 通过 CSV 批量导入选手。

### 6. 数据导出接口 (Export)
- `GET /api/export/players` - 导出选手列表 CSV。
- `GET /api/export/results` - 导出比赛成绩 CSV。
- `GET /api/export/schedule` - 导出赛程表 CSV。

### 7. 用户管理接口 (User Management)
- `GET /api/users` / `POST /api/users` / `PUT /api/users/:id` / `DELETE /api/users/:id` - 裁判/工作人员账号管理（仅 `referee` 可操作）。

### 8. 错误响应统一格式
```json
{
  "success": false,
  "error": "错误详细描述信息"
}
```

---

## 四、 CSV 批量导入数据校验契约 (CSV Import Contract)

对于 `POST /api/import/players` 批量导入接口：
- **格式要求**：UTF-8 编码，包含表头 `姓名,性别,队伍,初始积分`。
- **校验逻辑**：
  - `姓名`：非空，不超过 20 个字符。
  - `性别`：必须为 `M` 或 `F`（或对应中文字 `男`/`女`）。
  - `队伍`：不存在时自动在 `teams` 表中创建新队伍。
  - `初始积分`：可选，缺省默认 1200。

---

## 五、 WebSocket 实时消息协议格式 (WebSocket Payloads)

Durable Objects 与客户端（裁判手机/现场投影大屏）之间通过 WebSocket 进行实时双向通讯：

### 1. 比分实时更新事件 (`SCORE_UPDATE`)
```json
{
  "event": "SCORE_UPDATE",
  "match_id": 90071,
  "table_no": 1,
  "status": "in_progress",
  "current_set": 3,
  "scores": [[11, 9], [11, 8], [9, 11]],
  "p1_games": 2,
  "p2_games": 1,
  "timestamp": 1776001200
}
```

### 2. 球台分配/状态变更事件 (`TABLE_STATUS_CHANGE`)
```json
{
  "event": "TABLE_STATUS_CHANGE",
  "table_no": 3,
  "match_id": 90072,
  "status": "calling",
  "player1_name": "张三",
  "player2_name": "李四"
}
```

---

## 六、 离线优先同步机制 (Offline-First Sync)

为应对大型赛事体育馆网络拥堵导致的中断，裁判端应用采用本地优先 (Local-First) 架构：
1. **数据本地暂存**：网络断开时，记分器界面不会卡顿，裁判所有的比分变动操作会转化为操作日志（OpLog），并带上单调递增的 `opId` 和本地 `timestamp`，存入前端浏览器的 `IndexedDB`。
2. **重连自动回传**：一旦前端（Service Worker）探测到网络恢复，立即触发后台同步，调用 `POST /api/control/sync-oplog` 进行批量回传。
3. **API 契约 (Payload)**：
```json
{
  "matchId": 90071,
  "oplogs": [
    {
      "opId": 1,
      "timestamp": 1776001200,
      "type": "SCORE_UPDATE",
      "payload": { "set_number": 3, "l": 11, "r": 9 }
    }
  ]
}
```
4. **服务端状态合并**：收到断线重传序列后，边缘节点（或 DO）基于时间戳或 `opId` 进行 CRDT 乐观锁合并及幂等回放，防止重复计分，随后将最终追平的比分刷入 D1 持久层并向大屏广播。
