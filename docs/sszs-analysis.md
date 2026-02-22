# SSZS Legacy System Analysis

This document summarizes the analysis of the legacy SSZS (赛事助手) Windows application, which serves as the reference for PaddlePal's feature development.

## Reference Tournament

**2026年漳浦县「庆元宵」乒乓球个人排名赛**
- Date: February 28 - March 1, 2026
- Venue: 乒协球馆 (6 tables)
- Events: 甲组、乙组、丙组、女子组 Singles
- Format: Stage 1 Round Robin → Stage 2 Elimination

## SSZS Main Modules

### 1. Planning Panel (规划面板)
- Event configuration (singles/doubles/team)
- Stage settings (阶段): round robin, elimination, playoff
- Player/team count per group
- Advancement rules (晋级规则)
- Starting rank configuration

### 2. Draw Panel (抽签面板)
- Group assignment for round robin
- Manual positioning (手工入位)
- Automatic draw (自动抽签)
- Seed placement (种子位)
- Same-team separation (同队合理分开)
- Print draw results

### 3. Scheduling Panel (编排面板)
- Generate match schedule (生成赛程)
- Table/time allocation
- Export to Excel
- Import/export templates
- Copy/paste schedule

### 4. Control Panel (控场面板)
- Real-time monitoring of all tables (6台)
- Table reassignment (调场)
- Score entry (成绩录入)
- Check-in management (检录)
- Generate scoresheets (记分单)
- Match status tracking

### 5. Schedule View Panel (赛程面板)
- View by date/time/table
- Filter by event/stage
- Color coding by group/round

### 6. Query Panel (查询面板)
- Search by player name
- Search by event
- Match history

## Key Configuration Options

### Input Settings (输入设置)
```
☑ 快速输入 (只输入负方分数)     - Quick input (only enter losing score)
☑ 保存后自动跳到下一场          - Auto-advance after save
☐ 单项及团体赛使用大比分        - Use game score for singles/team
☐ 成绩录入后自动打印记分单      - Auto-print scoresheet after entry
☑ 单行连续输入比分              - Single-line continuous score input
☑ 录入成绩后是否自动关闭窗口    - Auto-close after score entry
☑ 检查比分合法性                - Validate score legality
☐ 每场比赛需要输入两次比分才能生效 - Require double entry
☐ 每场成绩需要裁判长确认才能生效   - Require referee confirmation
☐ 是否采集电子记分单            - Collect electronic scoresheets
☑ 录入成绩后焦点切到场次号栏    - Focus on match number after entry
☑ 团体赛未录入各单时保存成绩提示 - Warn if team match incomplete
☑ 胜方姓名上打对勾显示          - Show checkmark on winner
☐ 允许团体成员兼项              - Allow team member multi-entry
```

### Form Settings (表单设置)

**秩序册 (Program Book):**
- 导出淘汰表 - Export elimination bracket
- ITTF格式对阵图 - ITTF format bracket
- 淘汰赛是否使用全局位置号 - Global position numbers
- 晋级线斜线/加粗/高亮显示 - Advancement line styling
- 打印位置号角标 - Print position markers
- 按位置顺序显示比分 - Show scores by position

**成绩册 (Results Book):**
- 右上半区单元格: 大比分/积分 - Upper right: game score/points
- 左下半区单元格: 详细比分 - Lower left: detailed scores
- 导出循环表 - Export round robin table
- 显示前置对阵表 - Show preliminary bracket
- 显示彩色表格 - Color-coded tables
- 高亮胜方比分 - Highlight winner scores

**记分单 (Scoresheets):**
- 记分单模板_1/2/3 - Template options
- 自定义记分单模板 - Custom templates
- 每张纸打印 1/2/4 张表 - Sheets per page
- 团体成员人数为3/5 - Team size 3 or 5
- 允许重复打印记分单 - Allow reprint
- 允许打印无名记分单 - Allow blank scoresheets
- 双方入位才打印记分单 - Print only when both assigned
- 淘汰赛未轮决出名次 - Elimination round rankings
- 记分单使用队名简称 - Use team abbreviations
- 批量出单顺序: 按场次号/按球台+时间 - Batch order

**节目单 (Event Program):**
- 分组循环高亮显示不同组 - Highlight different groups
- 单淘汰高亮显示不同轮次 - Highlight different rounds
- 单淘汰显示上轮场次信息 - Show previous round info
- 显示队名/姓名/团体名 - Display options

### Scheduling Settings (编排设置)
```
分组循环轮转顺序:
○ 1号位固定顺时针轮转
○ 1号位固定逆时针轮转
○ 贝格尔轮转              - Berger rotation
● 朱轮12-23轮转
○ ITTF轮转

分组循环小组名:
● 以字母表示              - Letters (A, B, C...)
○ 以数字表示              - Numbers (1, 2, 3...)
☐ 超过26组自动采用数字表示

导出赛程信息:
● 横向排列
○ 纵向排列
☐ 按组排列
```

### Draw Settings (抽签设置)
```
分组循环:
默认组数: 4
组内最大人数: 4

单淘汰:
● 同队合理分开优先        - Prioritize same-team separation
○ 位置平衡优先            - Prioritize position balance

第2阶段前4名:
● 1-4, 2-3 同半区
○ 2, 3随机分布
○ 3, 4随机分布

控制措施:
☑ 强制合理分开
☑ 手工入位检查合法性

抽签结果:
☐ 有预编排时自动导入结果
☐ 无预编排自动生成新赛程
☑ 抽签完成后自动保存结果
☐ 抽签结果打印(简打)
☑ 分组循环简打按4组对齐
☑ 导入完成后退出窗口
```

## Score Entry Interface

### Main Elements
- 场次号 (Match ID): e.g., 90071
- 球台 (Table): 1-6
- 日期 (Date): 2026-2-28
- 时间 (Time): 8:30
- 双方运动员 (Players): 陈国荣 vs 林思琪
- 大比分 (Game Score): 3:1
- 局分 (Set Scores): 11-9, 11-8, 9-11, 11-3

### Quick Input Format
Continuous digit input: `1109110809111110`
- Parsed as: 11-09, 11-08, 09-11, 11-10
- System auto-detects winning score

### Action Buttons
- 保存(S) - Save
- 清成绩(C) - Clear scores
- 上一场(P) - Previous match
- 下一场(N) - Next match
- 换主客(W) - Swap home/away
- 计分单(□) - Scoresheet
- 裁判长签单(E) - Referee signature

### Waiver Options
- ☐ 左弃权(L) - Left player waiver
- ☐ 右弃权(R) - Right player waiver

## Export Tools

### U+ 秩序册/成绩册辅助排版工具 V1.7.07

**一键自动排版 (One-click Auto Layout):**
- 基础排版 - Basic layout
- 页面设置 - Page setup
- 列宽行高 - Column width/row height
- 字体字号 - Font settings
- 自动分页 - Auto pagination

**美化排版 (Enhanced Layout):**
- 序号左置 - Left-align numbers
- 背景色 - Background colors
- 边框线 - Borders
- 行合并 - Row merging

**参数设置:**
- 选择预设模板 → 秩序册（前置多行版）
- 保存模板 / 查看模板

**美化设置:**
- 选择预设模板 → 绿粉褐渐变模板

## File Structure

```
project_folder/
├── data.db                           # Main database
├── data (00-初始化).db               # Checkpoint: initialized
├── data (01-导入方案后).db           # Checkpoint: after import plan
├── data (02-导入名单后,抽签后).db    # Checkpoint: after roster & draw
├── data (03-生成赛程后).db           # Checkpoint: after scheduling
├── data (04-比赛开始前备份).db       # Checkpoint: before competition
├── 比赛表1.xlsx                      # Schedule spreadsheet
├── 比赛表1.pdf                       # Schedule PDF
├── 编排1.xlsx                        # Scheduling result
├── 记分单 (28日上午) A5横向.xlsx     # Scoresheets (morning)
├── 记分单 (28日上午) A5横向.pdf
├── 记分单 (28日下午) A5横向.xlsx     # Scoresheets (afternoon)
├── 记分单 (28日下午) A5横向.pdf
├── Record.log                        # Activity log
├── backup/                           # Backup folder
├── output/                           # Export output
├── download/                         # Downloads
└── pic/                              # Images
```

## Round Robin Table Format

```
┌─────────────────────────────────────────────────────────┐
│                   甲组单打第一阶段                        │
├─────┬────────┬────┬───┬───┬───┬───┬────┬────┬────┤
│对阵 │ 日期时间台号│ A组 │ 1 │ 2 │ 3 │ 4 │积分│计算│名次│
├─────┼────────┼────┼───┼───┼───┼───┼────┼────┼────┤
│ 1-3 │2-28 14:30 1台│ 1  │   │   │   │   │    │    │    │
│ 4-2 │    14:45 1台│陈思明│ ▓ │   │   │   │    │    │    │
├─────┼────────┼────┼───┼───┼───┼───┼────┼────┼────┤
│ 1-2 │2-28 15:15 1台│ 2  │   │   │   │   │    │    │    │
│ 3-4 │    15:30 1台│黄宽龙│   │ ▓ │   │   │    │    │    │
├─────┼────────┼────┼───┼───┼───┼───┼────┼────┼────┤
│ 1-4 │2-28 16:00 1台│ 3  │   │   │   │   │    │    │    │
│ 2-3 │    16:15 1台│林冠雄│   │   │ ▓ │   │    │    │    │
├─────┼────────┼────┼───┼───┼───┼───┼────┼────┼────┤
│     │            │ 4  │   │   │   │   │    │    │    │
│     │            │林和章│   │   │   │ ▓ │    │    │    │
└─────┴────────┴────┴───┴───┴───┴───┴────┴────┴────┘
```

## Elimination Bracket Format

```
甲组单打第二阶段

    1 ─┐
       ├─ 90031/1(1)/15:45 ─┐
    2 ─┘                    │
                            ├─ 90035/1(1)/17:15 ─ 决1、2名
    3 ─┐                    │
       ├─ 90032/1(2)/15:45 ─┘
    4 ─┘

    5 ─┐
       ├─ 90033/1(1)/16:45 ─┐
    6 ─┘                    │
                            ├─ 决3、4名
    7 ─┐                    │
       ├─ 90034/1(1)/17:00 ─┘
    8 ─┘

    (附加赛区)
    90029/1(3)/15:45 ─┐
                      ├─ 决5、6名
    90030/1(4)/15:45 ─┘
```

## Control Panel View

Real-time table monitoring showing:
- Date/Time
- 6 tables (1台-6台)
- Each cell displays:
  - Event code: 丙组(XS)
  - Player names: 陈国荣 林思琪
  - Match ID: 90071
  - Stage info: 1阶段A组1/5轮
  - Current score: 3:0
  - Schedule: 9:15/1 9:30/1

Color coding:
- Red background: Currently playing
- Yellow text: Completed
- Normal: Scheduled

## Implications for PaddlePal

### Priority Features to Implement

1. **Planning Module**
   - Event/stage configuration
   - Group count and advancement rules
   - Player count per group

2. **Draw Module**
   - Round robin group assignment
   - Seed positioning
   - Same-team separation algorithm
   - Manual override capability

3. **Scheduling Module**
   - Auto-generate match schedule
   - Table/time slot allocation
   - Berger/ITTF rotation support
   - Export to Excel/PDF

4. **Control Module**
   - Multi-table real-time view
   - Quick score entry (continuous digits)
   - Table reassignment
   - Referee confirmation workflow

5. **Export Module**
   - Program book (秩序册)
   - Results book (成绩册)
   - Scoresheets (记分单) - batch print
   - PDF generation

### Score Entry Enhancements
- Support quick input format: `1109110809111110`
- Auto-parse and validate scores
- Referee confirmation toggle
- Waiver handling (left/right)
- Auto-advance to next match

### Database Checkpoint System
- Implement backup points at key stages
- Allow rollback to previous state
- Track all modifications in log
