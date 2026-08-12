# 📓 PaddlePal 安全架构蓝图 (Security Architecture, SA)

本文档定义 PaddlePal（拍档）乒乓球赛事管理系统的 **安全架构 (SA)**，涵盖身份认证、RBAC 越权防护、现场并发防刷、CSRF/CORS 策略及审计日志规范。

---

## 一、 身份认证与 Session 防护

1. **HTTP-only Cookie 机制**：
   - 登录成功后返回加密 Session ID，设置 `HttpOnly; Secure; SameSite=Strict`，彻底防御 XSS 攻击读取 Cookie。
   - 禁止在客户端 JavaScript / LocalStorage 中暴露敏感 Token。
2. **密码哈希存储 (Password Hashing)**：
   - 裁判与工作人员账号密码使用强哈希算法（如 Web Crypto API / PBKDF2 / Argon2）哈希处理后存入 `referees.password_hash`。

---

## 二、 越权防护与 RBAC 动态鉴权 (Authorization)

1. **中间件统一拦截 (`src/middleware.ts`)**：
   - 所有以 `/api/admin/*` 开头的路由及敏感写入接口必须经过 `authMiddleware` 鉴权。
2. **角色权限隔离规则 (Role-Based Isolation)**：
   - `umpire` (裁判员)：只能录入被分配特定 `table_no` 的场次比分，比赛完成后自动锁定编辑权限。
   - `recorder` (记录员)：仅能调整球台与检录，无权更改最终得分。
   - `scheduler` (编排长)：拥有抽签与生成赛程权限，无权解锁 `confirmed` 锁定成绩。
   - `referee` (裁判长)：全量最高权限，有权解锁被锁定的违规/误操作成绩。

---

## 三、 现场比分录入幂等性与防抖 (Idempotency & Anti-Replay)

1. **幂等键防重机制 (Idempotency Key)**：
   - 裁判在提交比分 `POST /api/matches/:id/score` 时，包含递增的 `set_number` 与时间戳。
   - 服务端校验同一局同一时间戳的重复请求，忽略网络重试造成的二次加分。
2. **客户端输入防抖 (Debounce)**：
   - 比分加分按钮设置 300ms 物理防抖，防止手机连续误触造成比分错误。

---

## 四、 CSRF & CORS 安全防护策略

1. **同源策略 (Same-Origin Constraint)**：
   - 敏感管理 API 仅响应同源域名请求。
2. **跨域 CROS 限制**：
   - 公开比分 API (`/api/live`, `/api/schedule`) 开放只读 CORS Headers；所有写入 API 严格校验 Request `Origin` / `Referer`。

---

## 五、 生产环境安全与 Cloudflare WAF 防护

1. **Rate Limiting 防爆刷**：
   - 结合 Cloudflare WAF 速率限制，对登录接口 `POST /login` 限制每分钟最多 5 次失败重试，防御爆破。
2. **TypeScript 编译期漏洞防御**：
   - 开启 TypeScript 最高等级严格模式（`strict: true`），严禁 `any` 隐式转换，防止 SQL 拼接与对象注入漏洞。

---

## 六、 审计日志规范 (Audit Logging)

当 `referee` (裁判长) 对已被锁定的成绩执行解锁（Unlock）或强制改分操作时，系统将在后台自动记录审计日志：
- 包含操作人 ID、被修改场次 ID、修改前得分、修改后得分及操作时间戳，防止现场人为篡改争议。
