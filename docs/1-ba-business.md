# 📘 PaddlePal 业务架构蓝图 (Business Architecture, BA)

本文档定义 PaddlePal（拍档）乒乓球赛事管理系统的 **业务架构 (BA)**，涵盖遗留系统现状分析、目标业务流程、ITTF 官方术语、RBAC 权限矩阵、赛制规则、同分计算与异常处理逻辑。

---

## 一、 业务现状与 SSZS 遗留系统分析 (As-Is Analysis)

基于对传统乒乓球赛事助手（SSZS）遗留系统及实际赛事（如 *2026年漳浦县「庆元宵」乒乓球个人排名赛*）的业务分析：

### 1. 遗留系统核心模块能力
- **规划模块**：项目配置（单打/双打/团体）、阶段设置（循环赛/淘汰赛/附加赛）、组内人数、晋级规则、起始名次。
- **抽签模块**：分组循环抽签、手工入位、自动抽签、种子位设置、同队合理避让、抽签打印。
- **编排模块**：赛程自动生成、场地/时间分配、拷贝/粘贴赛程、Excel 模板导入导出。
- **控场模块**：多台（如 6 台）实时监控、检录管理、调场、成绩录入、自动生成记分单、比赛状态跟踪。
- **赛程与查询模块**：按日期/时间/台次查看，按项目/阶段/组别颜色标记，按运动员查询历史记录。

### 2. 传统业务控制规则与习惯
- **快捷比分录入**：支持单行连续数字格式输入（如 `1109110809111110` 自动解析为 `11-9, 11-8, 9-11, 11-10` 并识别胜方）。
- **编排轮转算法**：支持贝格尔轮转、朱轮（12-23）轮转、1号位固定顺时针/逆时针轮转、ITTF 轮转。
- **秩序册与记分单**：支持表格样式控制（大比分/详细比分）、记分单批量打印（A4/A5）、弃权处理（左/右弃权）。

---

## 二、 目标业务流程与 ITTF 官方术语 (To-Be & Terminology)

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

## 三、 权限矩阵 (Permission Matrix)

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

## 四、 角色职责说明 (Role Descriptions)

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

## 五、 核心业务规则 (Business Rules)

### 1. 裁判员比分录入 (Umpire Score Entry)
- 仅允许录入被分配的特定 `table_no` 或 `match_id` 比分。
- 比赛状态变更为 `finished` 后，裁判员不可直接修改比分。

### 2. 记录员调场 (Recorder Table Assignment)
- 记录员可调整 `table_no` (球台)、`time` (时间)、`umpire_id` (执裁裁判)。
- 记录员无权修改最终比赛结果 `result` 或比分 `scores`。

### 3. 成绩确认与锁定流程 (Score Confirmation Flow)
1. 裁判员录入比分完成 ➔ 状态置为 `finished`。
2. 裁判长复核确认 ➔ 状态置为 `confirmed`（锁定状态）。
3. 锁定后仅裁判长有权解锁进行修正。

---

## 六、 循环赛积分与同分计算规则 (Tie-Breaking Rules)

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

## 七、 淘汰赛种子分布与 Bye (轮空) 规则 (Knockout Rules)

1. **种子放置规范 (Seed Placement)**：
   - 1 号种子定位于签表顶部第 1 位（Upper Half Top）。
   - 2 号种子定位于签表底部最后一位（Lower Half Bottom）。
   - 3/4 号种子随机抽签放入上半区底部或下半区顶部。
   - 5-8 号种子随机抽签放入剩余四分之一区。
2. **轮空 (Bye) 分配原则**：
   - 当参赛人数不足 $2^N$ 进阶额度时，优先分配给高顺位种子选手轮空直接晋级下一轮。

---

## 八、 团体赛（Team Match）场次阵型规则 (Team Formats)

1. **斯韦斯林杯赛制 (Swaythling Cup Format)**：5 单打（ABC vs XYZ），五局三胜制。
2. **奥运会团体赛制 (Olympic Format)**：1 双打 + 4 单打（双打首发，两名单打兼双打选手限制）。

---

## 九、 异常赛事处理流程 (Exceptions & Appeals)

1. **退赛 (Retirement)**：比赛中因伤病等原因不能继续比赛者，已完成的局分有效，未完成的局分及后续场次记为对手胜。
2. **弃权 (Default)**：无故未到场或拒绝比赛者，该场次积 0 分，比分按 0:11（单打每局）记入。
3. **现场申诉与解锁修正 (Appeal & Correction)**：
   - 对判罚或比分存在争议时，裁判长可临时将该场次状态从 `confirmed` 置回 `in_progress`。
   - 修正完成后由裁判长重新确认并再次锁定。
