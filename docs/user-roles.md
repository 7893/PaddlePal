# User Roles and Permissions

PaddlePal implements a role-based access control system designed for table tennis tournament management.

## ITTF Official Terminology

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

## Permission Matrix

```
┌─────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│                     │  裁判长  │ 副裁判长 │  编排长  │  记录员  │  裁判员  │   公众   │
│       功能          │  Referee │  Deputy  │ Scheduler│ Recorder │  Umpire  │  Public  │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 赛事规划/设置       │    ✓     │    ○     │    ✗     │    ✗     │    ✗     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 执行抽签            │    ✓     │    ○     │    ✓     │    ✗     │    ✗     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 赛程编排            │    ✓     │    ○     │    ✓     │    ✗     │    ✗     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 分配台次/裁判员     │    ✓     │    ○     │    ✓     │    ✓     │    ✗     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 调场（换台/换时间） │    ✓     │    ○     │    ✓     │    ✓     │    ✗     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 修改任意比赛成绩    │    ✓     │    ○     │    ✓     │    ✗     │    ✗     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 确认/锁定成绩       │    ✓     │    ○     │    ✗     │    ✗     │    ✗     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 录入分配的场次比分  │    ✓     │    ○     │    ✓     │    ✗     │    ✓     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 查看比赛进度/统计   │    ✓     │    ✓     │    ✓     │    ✓     │    ✓     │    ✗     │
├─────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│ 查看实时比分/成绩   │    ✓     │    ✓     │    ✓     │    ✓     │    ✓     │    ✓     │
└─────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Legend: ✓ Permitted    ✗ Denied    ○ Inherited from Referee when on duty
```

## Role Descriptions

```
┌────────────────┬──────┬─────────────────────────────────────────────────┐
│      角色      │ 数量 │                    职责描述                     │
├────────────────┼──────┼─────────────────────────────────────────────────┤
│     裁判长     │  1   │ 赛前规划抽签，赛中确认比分，赛后宣读成绩        │
│    Referee     │      │ Overall responsibility for rules enforcement     │
│                │      │ and decisions throughout the competition        │
├────────────────┼──────┼─────────────────────────────────────────────────┤
│    副裁判长    │ 0~2  │ 辅助或轮值裁判长，小型比赛可兼任编排            │
│ Deputy Referee │      │ Assist the Referee in handling related matters, │
│                │      │ may handle scheduling in small tournaments      │
├────────────────┼──────┼─────────────────────────────────────────────────┤
│     编排长     │ 0~1  │ 大型比赛专设，执行赛程编排，可修改成绩          │
│   Scheduler    │      │ For large tournaments only, execute scheduling, │
│                │      │ can modify match results                        │
├────────────────┼──────┼─────────────────────────────────────────────────┤
│     记录员     │ 1~4  │ 监控比赛进度，执行调场，不能修改成绩            │
│    Recorder    │      │ Monitor match progress, reassign tables/times,  │
│                │      │ cannot modify results                           │
├────────────────┼──────┼─────────────────────────────────────────────────┤
│     裁判员     │ 若干 │ 执行具体赛台比赛的判罚，录入分配的场次          │
│     Umpire     │ Many │ Officiate specific table matches, enter scores  │
│                │      │ for assigned matches, cannot modify after end   │
├────────────────┼──────┼─────────────────────────────────────────────────┤
│      公众      │  -   │ 无需登录，只能查看公开的比分和成绩              │
│     Public     │      │ No login required, view-only access to          │
│                │      │ public scores and results                       │
└────────────────┴──────┴─────────────────────────────────────────────────┘
```

Note: Assistant Umpire (副裁判员) assists the Umpire with counting, net faults, etc.
In PaddlePal, this role is typically merged with Umpire for simplicity.

## Business Rules

### Umpire Score Entry
- Can only enter scores for assigned `table_no` or `match_id`
- Cannot modify after match status becomes `finished`

### Recorder Table Assignment
- Can modify `table_no`, `time`, `umpire_id`
- Cannot modify `result` or `scores`

### Score Confirmation Flow
1. Umpire enters score → status: `finished`
2. Referee confirms → status: `confirmed` (locked)
3. Only Referee can unlock for correction
