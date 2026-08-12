# 📙 PaddlePal 数据架构蓝图 (Data Architecture, DA)

本文档定义 PaddlePal（拍档）乒乓球赛事管理系统的 **数据架构 (DA)**，涵盖 Cloudflare D1 关系型数据库、KV 会话存储、R2 文件存储及 Durable Objects 实时协同数据模型。

---

## 一、 Cloudflare D1 全表字段级数据字典 (Data Dictionary)

系统存储采用 **Cloudflare D1 (SQLite)**，表结构由 `sql/schema.sql` 定义，包含 13 张表的完整字段定义：

### 1. `tournaments` (赛事表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 赛事 ID
- `name` (TEXT NOT NULL) - 赛事名称
- `venue` (TEXT NOT NULL) - 比赛地点
- `start_date` (TEXT NOT NULL) - 开始日期
- `end_date` (TEXT NOT NULL) - 结束日期
- `tables_count` (INTEGER DEFAULT 6) - 球台数量

### 2. `events` (比赛项目表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 项目 ID
- `tournament_id` (INTEGER FOREIGN KEY -> tournaments.id) - 所属赛事
- `title` (TEXT NOT NULL) - 项目标题（如“男子单打”）
- `event_type` (TEXT CHECK(event_type IN ('singles', 'doubles', 'team'))) - 项目类型
- `best_of` (INTEGER DEFAULT 5) - 赛制局数（3局2胜 / 5局3胜 / 7局4胜）
- `stage` (TEXT DEFAULT 'group') - 当前阶段 (`group` / `knockout`)

### 3. `teams` (队伍表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 队伍 ID
- `tournament_id` (INTEGER FOREIGN KEY -> tournaments.id) - 所属赛事
- `name` (TEXT NOT NULL) - 队伍/单位名称
- `flag_url` (TEXT) - 队旗 R2 图片 URL

### 4. `players` (选手表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 选手 ID
- `tournament_id` (INTEGER FOREIGN KEY -> tournaments.id) - 所属赛事
- `team_id` (INTEGER FOREIGN KEY -> teams.id) - 所属队伍
- `name` (TEXT NOT NULL) - 选手姓名
- `gender` (TEXT CHECK(gender IN ('M', 'F'))) - 性别
- `rating` (INTEGER DEFAULT 1200) - 初始积分

### 5. `matches` (比赛场次表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 场次 ID
- `event_id` (INTEGER FOREIGN KEY -> events.id) - 所属项目
- `stage` (TEXT NOT NULL) - 比赛阶段 (`group` / `knockout`)
- `round` (INTEGER NOT NULL) - 轮次
- `table_no` (INTEGER) - 分配球台号
- `status` (TEXT CHECK(status IN ('pending', 'calling', 'in_progress', 'finished', 'confirmed'))) - 场次状态
- `winner_id` (INTEGER FOREIGN KEY -> players.id) - 获胜选手 ID

### 6. `scores` (详细局分记录表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 记录 ID
- `match_id` (INTEGER FOREIGN KEY -> matches.id) - 所属场次
- `set_number` (INTEGER NOT NULL) - 局次 (1-7)
- `p1_score` (INTEGER NOT NULL) - 选手1得分
- `p2_score` (INTEGER NOT NULL) - 选手2得分

### 7. `group_tables` (循环赛分组表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 分组 ID
- `event_id` (INTEGER FOREIGN KEY -> events.id) - 所属项目
- `group_name` (TEXT NOT NULL) - 组名 (如 "A", "B")

### 8. `group_entries` (分组成绩积分表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 记录 ID
- `group_id` (INTEGER FOREIGN KEY -> group_tables.id) - 所属分组
- `player_id` (INTEGER FOREIGN KEY -> players.id) - 所属选手
- `played` (INTEGER DEFAULT 0) - 已赛场次
- `wins` (INTEGER DEFAULT 0) - 胜场数
- `losses` (INTEGER DEFAULT 0) - 负场数
- `pts` (INTEGER DEFAULT 0) - 总积分

### 9. `brackets` (淘汰赛对阵图表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 节点 ID
- `event_id` (INTEGER FOREIGN KEY -> events.id) - 所属项目
- `round` (INTEGER NOT NULL) - 轮次
- `position` (INTEGER NOT NULL) - 位置编号
- `player1_id` (INTEGER FOREIGN KEY -> players.id) - 上方选手
- `player2_id` (INTEGER FOREIGN KEY -> players.id) - 下方选手

### 10. `draws` (抽签历史记录表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 抽签 ID
- `event_id` (INTEGER FOREIGN KEY -> events.id) - 所属项目
- `draw_type` (TEXT NOT NULL) - 抽签类型 (`random` / `seeded`)
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP) - 抽签时间

### 11. `notices` (赛事公告通知表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 公告 ID
- `tournament_id` (INTEGER FOREIGN KEY -> tournaments.id) - 所属赛事
- `title` (TEXT NOT NULL) - 公告标题
- `content` (TEXT NOT NULL) - 公告内容
- `published_at` (DATETIME DEFAULT CURRENT_TIMESTAMP) - 发布时间

### 12. `referees` (裁判人员信息表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 账号 ID
- `username` (TEXT UNIQUE NOT NULL) - 登录用户名
- `password_hash` (TEXT NOT NULL) - 密码哈希
- `name` (TEXT NOT NULL) - 真实姓名
- `role` (TEXT CHECK(role IN ('referee', 'deputy_referee', 'scheduler', 'recorder', 'umpire'))) - 赋予角色

### 13. `ratings` (积分变动历史表)
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT) - 变动 ID
- `player_id` (INTEGER FOREIGN KEY -> players.id) - 所属选手
- `match_id` (INTEGER FOREIGN KEY -> matches.id) - 关联场次
- `old_rating` (INTEGER NOT NULL) - 变前积分
- `new_rating` (INTEGER NOT NULL) - 变后积分

---

## 二、 数据库索引设计 (Index Design)

为了在高并发查询下保证毫秒级响应，针对高频路由建立了以下索引：

1. **`idx_matches_status_table`** on `matches(status, table_no)` — 优化大屏与实时检录比分路由 `/api/live`。
2. **`idx_scores_match_set`** on `scores(match_id, set_number)` — 优化局分查询与快速计算。
3. **`idx_players_tournament_team`** on `players(tournament_id, team_id)` — 优化队旗与选手按单位分组呈现。

---

## 三、 D1 事务与数据一致性保护 (Batch Transactions)

在“成绩确认并生成下一轮淘汰树”时，使用 D1 的批量事务 API (`env.DB.batch([...])`) 保证原子性：
- 变更加分/胜负判定、更正 `matches.status`、更新 `group_entries` 积分、更新 `brackets` 下一轮对阵节点，在同一个 Batch 事务中提交，失败自动回滚。

---

## 四、 Cloudflare KV 会话与缓存设计 (KV Store)

- **绑定标识**：`env.SESSIONS`
- **会话 Session 缓存格式**：
  - Key: `session:{session_id}`
  - Value (JSON): `{ "userId": 1, "username": "admin", "role": "referee", "expiresAt": 1776000000 }`
  - TTL 过期时间：默认 24 小时自动清理。

---

## 五、 Cloudflare R2 文件与媒体存储 (R2 Bucket)

- **绑定标识**：`env.FILES`
- **存储桶名称**：`paddlepal-files`
- **目录规划**：
  - `flags/{team_id}.png` - 队伍队旗图片。
  - `exports/{tournament_id}/schedule.csv` - 导出的赛程与成绩静态文件。

---

## 六、 Durable Objects 实时协同数据模型 (Durable Objects)

- **绑定标识**：`env.DO`
- **类名**：`DO`
- **内存数据模型**：
  - `activeMatches`: `Map<tableNo, MatchState>` (当前球台锁与分数值)。
  - `connectedClients`: `Set<WebSocket>` (保持连接的大屏与裁判客户端列表)。
