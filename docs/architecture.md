# PaddlePal 5A 综合架构设计蓝图 (Comprehensive Architecture Blueprint)

本文档是 PaddlePal（拍档）乒乓球赛事管理系统的 **5A 综合架构设计蓝图**，涵盖业务架构 (BA)、应用架构 (AA)、数据架构 (DA)、技术架构 (TA) 与安全架构 (SA)。

---

## 第一章：业务架构 (Business Architecture, BA)

### 1.1 业务现状与 SSZS 遗留系统分析 (As-Is Analysis)

基于对传统乒乓球赛事助手（SSZS）遗留系统及实际赛事（如 *2026年漳浦县「庆元宵」乒乓球个人排名赛*）的业务分析：

#### 1. 遗留系统核心模块能力
- **规划模块**：项目配置（单打/双打/团体）、阶段设置（循环赛/淘汰赛/附加赛）、组内人数、晋级规则、起始名次。
- **抽签模块**：分组循环抽签、手工入位、自动抽签、种子位设置、同队合理避让、抽签打印。
- **编排模块**：赛程自动生成、场地/时间分配、拷贝/粘贴赛程、Excel 模板导入导出。
- **控场模块**：多台（如 6 台）实时监控、检录管理、调场、成绩录入、自动生成记分单、比赛状态跟踪。
- **赛程与查询模块**：按日期/时间/台次查看，按项目/阶段/组别颜色标记，按运动员查询历史记录。

#### 2. 传统业务控制规则与习惯
- **快捷比分录入**：支持单行连续数字格式输入（如 `1109110809111110` 自动解析为 `11-9, 11-8, 9-11, 11-10` 并识别胜方）。
- **编排轮转算法**：支持贝格尔轮转、朱轮（12-23）轮转、1号位固定顺时针/逆时针轮转、ITTF 轮转。
- **秩序册与记分单**：支持表格样式控制（大比分/详细比分）、记分单批量打印（A4/A5）、弃权处理（左/右弃权）。

---

### 1.2 目标业务流程与 ITTF 官方术语 (To-Be & Terminology)

Based on [ITTF Handbook for Match Officials](https://www.ittf.com):

| 中文 | English | Description |
|------|---------|-------------|
| 裁判长 | Referee | 全面负责比赛规则的执行和裁决 |
| 副裁判长 | Deputy Referee | 协助裁判长处理相关事宜 |
| 裁判员 | Umpire | 执行具体赛台比赛的判罚 |
| 副裁判员 | Assistant Umpire | 协助主裁判，负责计数、判罚擦网等 |
| 计时员 | Timekeeper | 负责轮换发球法的计时 |
| 数板员 | Stroke Counter | 负责轮换发球法的击球计数 |
| 编排 | Scheduling | 赛程安排、场次分配 |
| 记录 | Recording | 比分记录、成绩登记 |

---

### 1.3 权限矩阵 (Permission Matrix)

| 功能 | 裁判长<br>Referee | 副裁判长<br>Deputy Referee | 编排长<br>Scheduler | 记录员<br>Recorder | 裁判员<br>Umpire | 公众<br>Public |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| 赛事规划/设置 | ✓ | ○ | ✗ | ✗ | ✗ | ✗ |
| 执行抽签 | ✓ | ○ | ✓ | ✗ | ✗ | ✗ |
| 赛程编排 | ✓ | ○ | ✓ | ✗ | ✗ | ✗ |
| 分配台次/裁判员 | ✓ | ○ | ✓ | ✓ | ✗ | ✗ |
| 调场（换台/换时间） | ✓ | ○ | ✓ | ✓ | ✗ | ✗ |
| 修改任意比赛成绩 | ✓ | ○ | ✓ | ✗ | ✗ | ✗ |
| 确认/锁定成绩 | ✓ | ○ | ✗ | ✗ | ✗ | ✗ |
| 录入分配的场次比分 | ✓ | ○ | ✓ | ✗ | ✓ | ✗ |
| 查看比赛进度/统计 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| 查看实时比分/成绩 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

*Legend: ✓ Permitted &nbsp;&nbsp; ✗ Denied &nbsp;&nbsp; ○ Inherited from Referee when on duty*

---

### 1.4 角色职责说明 (Role Descriptions)

| 角色 | 数量 | 职责描述 |
| :--- | :---: | :--- |
| **裁判长**<br>Referee | 1 | 赛前规划抽签，赛中确认比分，赛后宣读成绩<br>*Overall responsibility for rules enforcement and decisions throughout the competition* |
| **副裁判长**<br>Deputy Referee | 0~2 | 辅助或轮值裁判长，小型比赛可兼任编排<br>*Assist the Referee in handling related matters, may handle scheduling in small tournaments* |
| **编排长**<br>Scheduler | 0~1 | 大型比赛专设，执行赛程编排，可修改成绩<br>*For large tournaments only, execute scheduling, can modify match results* |
| **记录员**<br>Recorder | 1~4 | 监控比赛进度，执行调场，不能修改成绩<br>*Monitor match progress, reassign tables/times, cannot modify results* |
| **裁判员**<br>Umpire | 若干 | 执行具体赛台比赛的判罚，录入分配的场次<br>*Officiate specific table matches, enter scores for assigned matches, cannot modify after end* |
| **公众**<br>Public | - | 无需登录，只能查看公开的比分和成绩<br>*No login required, view-only access to public scores and results* |

*Note: Assistant Umpire (副裁判员) typically merged with Umpire in PaddlePal for simplicity.*

---

### 1.5 核心业务规则 (Business Rules)

#### 1. 裁判员比分录入 (Umpire Score Entry)
- 仅允许录入被分配的特定 `table_no` 或 `match_id` 比分。
- 比赛状态变更为 `finished` 后，裁判员不可直接修改比分。

#### 2. 记录员调场 (Recorder Table Assignment)
- 记录员可调整 `table_no` (球台)、`time` (时间)、`umpire_id` (执裁裁判)。
- 记录员无权修改最终比赛结果 `result` 或比分 `scores`。

#### 3. 成绩确认与锁定流程 (Score Confirmation Flow)
1. 裁判员录入比分完成 ➔ 状态置为 `finished`。
2. 裁判长复核确认 ➔ 状态置为 `confirmed`（锁定状态）。
3. 锁定后仅裁判长有权解锁进行修正。

---

## 第二章：应用架构 (Application Architecture, AA)

### 2.1 核心应用模块划分

```
src/
├── index.ts          # 应用入口 (Hono Router)
├── middleware.ts     # 认证与 RBAC 中间件
├── scoring.ts        # 比分计算与算法逻辑
├── types.ts          # TypeScript 全量类型定义
├── utils.ts          # 独立工具函数
├── validate.ts       # 输入数据校验逻辑
├── do/               # Durable Objects 实时协同模块
├── components/       # JSX UI 视图组件 (Layout, Match, etc.)
├── routes/           # RESTful API & 页面路由
└── views/            # 前端页面视图 (Home, Live, Admin, etc.)
```

---

### 2.2 完整 API 接口契约 (API Reference)

#### 1. 鉴权说明
大部分管理接口需要通过 Session Cookie 进行身份验证。登录接口位于 `POST /login`。

#### 2. 公开接口 (Public Endpoints)
- `GET /api/live` - 获取当前正在进行的比赛比分及状态。
- `GET /api/schedule` - 获取赛程安排。支持查询参数 `date` (YYYY-MM-DD) 与 `table` (球台号)。
- `GET /api/rankings` - 获取选手积分与排名榜。支持查询参数 `event_id`。
- `GET /api/search?q={query}` - 按选手姓名模糊搜索比赛历史。

#### 3. 比赛管理接口 (Match Management)
- `POST /api/matches/:id/score` - 录入/更新比赛比分（需 `recorder` 及以上权限）。
  ```json
  { "scores": [[11, 9], [11, 7], [9, 11], [11, 5]] }
  ```
- `POST /api/checkin/:matchId` - 选手检录与球台分配（需 `scheduler` 及以上权限）。
  ```json
  { "table_no": 3 }
  ```
- `POST /api/confirm/:matchId` - 确认并锁定比赛成绩（需 `referee` 权限）。

#### 4. 抽签与对阵接口 (Draw & Bracket)
- `POST /api/draw/:eventId` - 执行抽签（支持 `random` 或 `seeded` 算法，需 `scheduler` 及以上权限）。
- `GET /api/bracket/:eventId` - 获取淘汰赛树状图结构。

#### 5. 赛事管理后台接口 (Admin Endpoints)
- `GET /api/admin/tournaments` - 赛事列表。
- `POST /api/admin/tournaments` - 创建赛事（名称、地点、日期、球台数）。
- `PUT /api/admin/tournaments/:id` - 更新赛事配置。
- `DELETE /api/admin/tournaments/:id` - 删除赛事。
- `GET /api/admin/events` - 项目列表（如男单、女单、双打）。
- `POST /api/admin/events` - 创建项目（赛制、局数 `best_of`）。
- `GET /api/admin/players` - 选手列表。
- `POST /api/admin/players` - 新增选手。
- `POST /api/import/players` - 通过 CSV 批量导入选手。

#### 6. 数据导出接口 (Export)
- `GET /api/export/players` - 导出选手列表 CSV。
- `GET /api/export/results` - 导出比赛成绩 CSV。
- `GET /api/export/schedule` - 导出赛程表 CSV。

#### 7. 用户管理接口 (User Management)
- `GET /api/users` / `POST /api/users` / `PUT /api/users/:id` / `DELETE /api/users/:id` - 裁判/工作人员账号管理（仅 `referee` 可操作）。

#### 8. 错误响应统一格式
```json
{
  "success": false,
  "error": "错误详细描述信息"
}
```

---

## 第三章：数据架构 (Data Architecture, DA)

### 3.1 Cloudflare D1 数据库设计 (D1 SQLite Schema)

系统核心存储采用 **Cloudflare D1 (SQLite)**，表结构详见 `sql/schema.sql`，共包含 13 张核心业务表：

| 表名 (Table) | 描述 (Description) | 关键字段 (Key Columns) |
| :--- | :--- | :--- |
| `tournaments` | 赛事表 | `id`, `name`, `venue`, `start_date`, `end_date`, `tables_count` |
| `events` | 比赛项目表 | `id`, `tournament_id`, `title`, `event_type`, `best_of`, `stage` |
| `teams` | 队伍表 | `id`, `tournament_id`, `name`, `flag_url` |
| `players` | 选手表 | `id`, `tournament_id`, `team_id`, `name`, `gender`, `rating` |
| `matches` | 比赛场次表 | `id`, `event_id`, `stage`, `round`, `table_no`, `status`, `winner_id` |
| `scores` | 详细局分记录表 | `id`, `match_id`, `set_number`, `p1_score`, `p2_score` |
| `group_tables` | 循环赛分组表 | `id`, `event_id`, `group_name` |
| `group_entries` | 分组成绩积分表 | `id`, `group_id`, `player_id`, `played`, `wins`, `losses`, `pts` |
| `brackets` | 淘汰赛树状图表 | `id`, `event_id`, `round`, `position`, `player1_id`, `player2_id` |
| `draws` | 抽签历史记录表 | `id`, `event_id`, `draw_type`, `created_at` |
| `notices` | 赛事公告通知表 | `id`, `tournament_id`, `title`, `content`, `published_at` |
| `referees` | 裁判人员信息表 | `id`, `username`, `password_hash`, `name`, `role` |
| `ratings` | 积分变动历史表 | `id`, `player_id`, `match_id`, `old_rating`, `new_rating` |

---

### 3.2 Cloudflare KV 会话与缓存设计 (KV Store)

- **绑定标识**：`env.SESSIONS`
- **会话 Session 缓存格式**：
  - Key: `session:{session_id}`
  - Value (JSON): `{ "userId": 1, "username": "admin", "role": "referee", "expiresAt": 1776000000 }`
  - TTL 过期时间：默认 24 小时自动清理。

---

### 3.3 Cloudflare R2 文件与媒体存储 (R2 Bucket)

- **绑定标识**：`env.FILES`
- **存储桶名称**：`paddlepal-files`
- **目录规划**：
  - `flags/{team_id}.png` - 队伍队旗图片。
  - `exports/{tournament_id}/schedule.csv` - 导出的赛程与成绩静态文件。

---

### 3.4 Durable Objects 实时协同数据模型 (Durable Objects)

- **绑定标识**：`env.DO`
- **类名**：`DO`
- **作用**：现场实时球台比分锁控制与 WebSocket 广播，保证现场多终端（大屏/裁判/观众）毫秒级零延迟比分同步。

---

## 第四章：技术架构 (Technical Architecture, TA)

### 4.1 技术选型与依赖基线

| 维度 | 选型/技术 | 版本/规范 |
| :--- | :--- | :--- |
| **运行时 (Runtime)** | Cloudflare Workers | Node.js >=24.18.1 / ES Module (`"type": "module"`) |
| **包管理器 (Package)** | pnpm | >=11.19.0 (使用根级 `overrides` 与 `onlyBuiltDependencies`) |
| **Web 框架 (Framework)** | Hono + JSX | ^4.12.34 |
| **语言 (Language)** | TypeScript | ^5.9.3 (严格模式，禁止 `any`) |
| **CLI / 工具链** | Wrangler | ^4.121.0 |
| **测试框架 (Testing)** | Vitest | ^4.1.10 |

---

### 4.2 Cloudflare 边缘绑定架构 (`wrangler.toml`)

```toml
name = "paddlepal"
main = "src/index.ts"
compatibility_date = "2026-07-01"

[[d1_databases]]
binding = "DB"
database_name = "paddlepal-db"
database_id = "<d1-database-id>"

[[kv_namespaces]]
binding = "SESSIONS"
id = "<kv-namespace-id>"

[[r2_buckets]]
binding = "FILES"
bucket_name = "paddlepal-files"

[durable_objects]
bindings = [{ name = "DO", class_name = "DO" }]
```

---

## 第五章：安全架构 (Security Architecture, SA)

### 5.1 身份认证与 Session 防护
- 使用基于 HTTP-only Cookie 的会话凭证，禁止在前端脚本中暴露敏感 Token。
- 密码哈希存储：采用安全的 Password Hashing 算法存储在 `referees` 表中。

### 5.2 越权防护与 RBAC 动态鉴权
- 中间件机制 (`src/middleware.ts`) 强制拦截所有 `/api/admin/*` 与写入接口。
- **角色权限隔离**：
  - `umpire` (裁判员) 只能录入自己被分配球台的比分，且比赛结束后无法二次篡改。
  - `recorder` (记录员) 仅能调整球台与时间，无权修改比分结果。
  - 锁定（`confirmed`）后的成绩只能由 `referee` (裁判长) 解锁。

### 5.3 生产环境安全与 WAF
- 防爆刷与速率限制：结合 Cloudflare WAF / Rate Limiting 规则防止恶意 API 攻击。
- TypeScript 全量类型安全：代码库禁止 `any` 与隐式转换，防止注入与漏洞。
