# User Roles and Permissions

PaddlePal implements a role-based access control system designed for table tennis tournament management.

## Permission Matrix

```
┌─────────────────────┬────────┬────────┬────────┬────────┬────────┬────────┐
│                     │ 裁判长 │副裁判长│ 编排长 │ 记录员 │ 裁判员 │  公众  │
│       功能          │ chief  │ deputy │scheduler│recorder│ umpire │ public │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 赛事规划/设置       │   ✓    │   ○    │   ✗    │   ✗    │   ✗    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 执行抽签            │   ✓    │   ○    │   ✓    │   ✗    │   ✗    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 赛程编排            │   ✓    │   ○    │   ✓    │   ✗    │   ✗    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 分配台次/裁判员     │   ✓    │   ○    │   ✓    │   ✓    │   ✗    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 调场（换台/换时间） │   ✓    │   ○    │   ✓    │   ✓    │   ✗    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 修改任意比赛成绩    │   ✓    │   ○    │   ✓    │   ✗    │   ✗    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 确认/锁定成绩       │   ✓    │   ○    │   ✗    │   ✗    │   ✗    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 录入分配的场次比分  │   ✓    │   ○    │   ✓    │   ✗    │   ✓    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 查看比赛进度/统计   │   ✓    │   ✓    │   ✓    │   ✓    │   ✓    │   ✗    │
├─────────────────────┼────────┼────────┼────────┼────────┼────────┼────────┤
│ 查看实时比分/成绩   │   ✓    │   ✓    │   ✓    │   ✓    │   ✓    │   ✓    │
└─────────────────────┴────────┴────────┴────────┴────────┴────────┴────────┘

Legend: ✓ Permitted    ✗ Denied    ○ Inherited from Chief Referee when on duty
```

## Role Descriptions

```
┌────────────┬──────┬─────────────────────────────────────────────────┐
│    角色    │ 数量 │                    职责描述                     │
├────────────┼──────┼─────────────────────────────────────────────────┤
│   裁判长   │  1   │ 赛前规划抽签，赛中确认比分，赛后宣读成绩        │
│ Chief Ref  │      │ Pre-match planning & draw, confirm scores,      │
│            │      │ announce final results                          │
├────────────┼──────┼─────────────────────────────────────────────────┤
│  副裁判长  │ 0~2  │ 辅助或轮值裁判长，小型比赛可兼任编排            │
│ Deputy Ref │      │ Assist or rotate as chief referee,              │
│            │      │ may handle scheduling in small tournaments      │
├────────────┼──────┼─────────────────────────────────────────────────┤
│   编排长   │ 0~1  │ 大型比赛专设，执行赛程编排，可修改成绩          │
│ Scheduler  │      │ For large tournaments only, execute scheduling, │
│            │      │ can modify match results                        │
├────────────┼──────┼─────────────────────────────────────────────────┤
│   记录员   │ 1~4  │ 监控比赛进度，执行调场，不能修改成绩            │
│  Recorder  │      │ Monitor match progress, reassign tables/times,  │
│            │      │ cannot modify results                           │
├────────────┼──────┼─────────────────────────────────────────────────┤
│   裁判员   │ 若干 │ 录入分配的台次/场次，结束后不能修改             │
│   Umpire   │ Many │ Enter scores for assigned tables/matches,       │
│            │      │ cannot modify after match ends                  │
├────────────┼──────┼─────────────────────────────────────────────────┤
│    公众    │  -   │ 无需登录，只能查看公开的比分和成绩              │
│   Public   │      │ No login required, view-only access to          │
│            │      │ public scores and results                       │
└────────────┴──────┴─────────────────────────────────────────────────┘
```

## Business Rules

### Umpire Score Entry
- Can only enter scores for assigned `table_no` or `match_id`
- Cannot modify after match status becomes `finished`

### Recorder Table Assignment
- Can modify `table_no`, `time`, `umpire_id`
- Cannot modify `result` or `scores`

### Score Confirmation Flow
1. Umpire enters score → status: `finished`
2. Chief Referee confirms → status: `confirmed` (locked)
3. Only Chief Referee can unlock for correction
