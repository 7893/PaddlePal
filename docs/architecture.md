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
| 查看实时比分/成绩 | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
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

### 1.6 循环赛积分与同分计算规则 (Tie-Breaking Rules)

依据国际乒联（ITTF）竞赛规则及 SSZS 业务逻辑：

1. **基本积分分配**：
   - 胜 1 场得 2 分；
   - 负 1 场（正常完成）得 1 分；
   - 弃权/未完成比赛得 0 分。
2. **同分排名判定顺序 (Tie-Breaking Priority)**：
   - **两名选手积分相同**：以两名选手相互之间比赛的胜负关系判定，胜者名次在前。
   - **三名及以上选手积分相同**：
     1. 计算同分选手**相互之间比赛**的积分；
     2. 若仍相同，计算同分选手相互之间比赛的**胜负局比率 (Sets Ratio)**：`总胜局数 / 总负局数`；
     3. 若局率仍相同，计算同分选手相互之间比赛的**胜负分比率 (Points Ratio)**：`总得分数 / 总失分数`；
     4. 若分率仍相同，由裁判长抽签或计算全组所有比赛的局率/分率判定。

---

### 1.7 异常赛事处理流程 (Exceptions & Appeals)

1. **退赛 (Retirement)**：比赛中因伤病等原因不能继续比赛者，已完成的局分有效，未完成的局分及后续场次记为对手胜。
2. **弃权 (Default)**：无故未到场或拒绝比赛者，该场次积 0 分，比分按 0:11（单打每局）记入。
3. **现场申诉与解锁修正 (Appeal & Correction)**：
   - 对判罚或比分存在争议时，裁判长可临时将该场次状态从 `confirmed` 置回 `in_progress`。
   - 修正完成后由裁判长重新确认并再次锁定。

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

### 2.3 WebSocket 实时消息协议格式 (WebSocket Payloads)

Durable Objects 与客户端（裁判手机/现场投影大屏）之间通过 WebSocket 进行实时双向通讯：

#### 1. 比分实时更新事件 (`SCORE_UPDATE`)
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

#### 2. 球台分配/状态变更事件 (`TABLE_STATUS_CHANGE`)
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

## 第三章：数据架构 (Data Architecture, DA)

### 3.1 Cloudflare D1 全表字段级数据字典 (Data Dictionary)

系统存储采用 **Cloudflare D1 (SQLite)**，表结构由 `sql/schema.sql` 定义，包含 13 张表的完整字段定义：

#### 1. `tournaments` (赛事表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 赛事 ID
- `name` (TEXT NOT NULL) - 赛事名称
- `venue` (TEXT NOT NULL) - 比赛地点
- `start_date` (TEXT NOT NULL) - 开始日期
- `end_date` (TEXT NOT NULL) - 结束日期
- `tables_count` (INTEGER DEFAULT 6) - 球台数量

#### 2. `events` (比赛项目表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 项目 ID
- `tournament_id` (INTEGER FOREIGN KEY -> tournaments.id) - 所属赛事
- `title` (TEXT NOT NULL) - 项目标题（如“男子单打”）
- `event_type` (TEXT CHECK(event_type IN ('singles', 'doubles', 'team'))) - 项目类型
- `best_of` (INTEGER DEFAULT 5) - 赛制局数（3局2胜 / 5局3胜 / 7局4胜）
- `stage` (TEXT DEFAULT 'group') - 当前阶段 (`group` / `knockout`)

#### 3. `teams` (队伍表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 队伍 ID
- `tournament_id` (INTEGER FOREIGN KEY -> tournaments.id) - 所属赛事
- `name` (TEXT NOT NULL) - 队伍/单位名称
- `flag_url` (TEXT) - 队旗 R2 图片 URL

#### 4. `players` (选手表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 选手 ID
- `tournament_id` (INTEGER FOREIGN KEY -> tournaments.id) - 所属赛事
- `team_id` (INTEGER FOREIGN KEY -> teams.id) - 所属队伍
- `name` (TEXT NOT NULL) - 选手姓名
- `gender` (TEXT CHECK(gender IN ('M', 'F'))) - 性别
- `rating` (INTEGER DEFAULT 1200) - 初始积分

#### 5. `matches` (比赛场次表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 场次 ID
- `event_id` (INTEGER FOREIGN KEY -> events.id) - 所属项目
- `stage` (TEXT NOT NULL) - 比赛阶段 (`group` / `knockout`)
- `round` (INTEGER NOT NULL) - 轮次
- `table_no` (INTEGER) - 分配球台号
- `status` (TEXT CHECK(status IN ('pending', 'calling', 'in_progress', 'finished', 'confirmed'))) - 场次状态
- `winner_id` (INTEGER FOREIGN KEY -> players.id) - 获胜选手 ID

#### 6. `scores` (详细局分记录表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 记录 ID
- `match_id` (INTEGER FOREIGN KEY -> matches.id) - 所属场次
- `set_number` (INTEGER NOT NULL) - 局次 (1-7)
- `p1_score` (INTEGER NOT NULL) - 选手1得分
- `p2_score` (INTEGER NOT NULL) - 选手2得分

#### 7. `group_tables` (循环赛分组表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 分组 ID
- `event_id` (INTEGER FOREIGN KEY -> events.id) - 所属项目
- `group_name` (TEXT NOT NULL) - 组名 (如 "A", "B")

#### 8. `group_entries` (分组成绩积分表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 记录 ID
- `group_id` (INTEGER FOREIGN KEY -> group_tables.id) - 所属分组
- `player_id` (INTEGER FOREIGN KEY -> players.id) - 所属选手
- `played` (INTEGER DEFAULT 0) - 已赛场次
- `wins` (INTEGER DEFAULT 0) - 胜场数
- `losses` (INTEGER DEFAULT 0) - 负场数
- `pts` (INTEGER DEFAULT 0) - 总积分

#### 9. `brackets` (淘汰赛对阵图表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 节点 ID
- `event_id` (INTEGER FOREIGN KEY -> events.id) - 所属项目
- `round` (INTEGER NOT NULL) - 轮次
- `position` (INTEGER NOT NULL) - 位置编号
- `player1_id` (INTEGER FOREIGN KEY -> players.id) - 上方选手
- `player2_id` (INTEGER FOREIGN KEY -> players.id) - 下方选手

#### 10. `draws` (抽签历史记录表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 抽签 ID
- `event_id` (INTEGER FOREIGN KEY -> events.id) - 所属项目
- `draw_type` (TEXT NOT NULL) - 抽签类型 (`random` / `seeded`)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP) - 抽签时间

#### 11. `notices` (赛事公告通知表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 公告 ID
- `tournament_id` (INTEGER FOREIGN KEY -> tournaments.id) - 所属赛事
- `title` (TEXT NOT NULL) - 公告标题
- `content` (TEXT NOT NULL) - 公告内容
- `published_at` (DATETIME DEFAULT CURRENT_TIMESTAMP) - 发布时间

#### 12. `referees` (裁判人员信息表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 账号 ID
- `username` (TEXT UNIQUE NOT NULL) - 登录用户名
- `password_hash` (TEXT NOT NULL) - 密码哈希
- `name` (TEXT NOT NULL) - 真实姓名
- `role` (TEXT CHECK(role IN ('referee', 'deputy_referee', 'scheduler', 'recorder', 'umpire'))) - 赋予角色

#### 13. `ratings` (积分变动历史表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 变动 ID
- `player_id` (INTEGER FOREIGN KEY -> players.id) - 所属选手
- `match_id` (INTEGER FOREIGN KEY -> matches.id) - 关联场次
- `old_rating` (INTEGER NOT NULL) - 变前积分
- `new_rating` (INTEGER NOT NULL) - 变后积分

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

### 4.3 边缘计算性能与 SLA 限制指标 (Performance & SLA)

- **接口响应延迟 (Edge Latency)**：P95 目标响应时间 < 50ms（利用 Cloudflare 全球边缘节点覆盖）。
- **实时广播延迟 (WebSocket SLA)**：比分录入到大屏渲染延迟 < 100ms。
- **Worker 执行限制**：单次 HTTP 请求 CPU 时间限制为 50ms（默认标准，可启用 Fluid Compute 动态调整）。
- **D1 读写优化**：在高频大屏查询路由（`/api/live`）中对 `matches` 表增加 `(status, table_no)` 复合索引，消除全表扫描。

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

### 5.4 现场比分录入幂等性防护 (Idempotency)
- 体育馆网络可能存在抖动重试，裁判手机提交比分请求时附带客户端生成的自增序号或事务 Key。
- 服务端校验防止同一局比分因弱网重试而被重复加分。
