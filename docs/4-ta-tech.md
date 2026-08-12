# 📕 PaddlePal 技术架构蓝图 (Technical Architecture, TA)

本文档定义 PaddlePal（拍档）乒乓球赛事管理系统的 **技术架构 (TA)**，涵盖技术选型、Cloudflare 边缘资源绑定、性能与 SLA 限制指标以及 CI/CD 自动化门禁。

---

## 一、 技术选型与依赖基线

| 维度 | 选型/技术 | 版本/规范 | 说明 |
| :--- | :--- | :--- | :--- |
| **运行时 (Runtime)** | Cloudflare Workers | Node.js >=24.18.1 / ES Module | 无服务器边缘计算环境 |
| **包管理器 (Package)** | pnpm | >=11.19.0 | 顶层 `overrides` & `onlyBuiltDependencies` |
| **Web 框架 (Framework)** | Hono + JSX | ^4.12.34 | 极轻量边缘 SSR 框架 |
| **语言 (Language)** | TypeScript | ^5.9.3 | 严格模式 (Strict)，禁止 `any` |
| **CLI / 工具链** | Wrangler | ^4.121.0 | Cloudflare 官方部署与测试工具 |
| **测试框架 (Testing)** | Vitest | ^4.1.10 | 高速单元测试框架 |

---

## 二、 Cloudflare 边缘绑定架构 (`wrangler.toml`)

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

## 三、 边缘计算性能与 SLA 限制指标 (Performance & SLA)

1. **接口响应延迟 (Edge Latency)**：P95 目标响应时间 < 50ms（利用 Cloudflare 全球边缘节点覆盖）。
2. **实时广播延迟 (WebSocket SLA)**：比分录入到大屏渲染延迟 < 100ms。
3. **Worker 执行限制**：单次 HTTP 请求 CPU 时间限制为 50ms（默认标准，可启用 Fluid Compute 动态调整）。
4. **D1 读写限制优化**：在高频大屏查询路由（`/api/live`）中增加复合索引，保证即使在 100 个球台并发时仍不超限。

---

## 四、 离线与弱网容错网络拓扑 (Offline-First Strategy)

针对体育馆信号拥堵、Wi-Fi 不稳定场景：
1. **裁判端本地缓存 (Umpire Local Buffer)**：裁判手机端使用 IndexedDB / LocalStorage 暂存未发送成功的得分指令。
2. **状态自动重连与同步 (Auto-Reconnection)**：断网恢复后，带上 Timestamp 与 Transaction ID 按序向 Durable Objects 批量补发，自动合并状态。

---

## 五、 CI/CD 自动化门禁与部署管道 (Automation Pipeline)

代码变更提交至 GitHub 仓库后，自动触发 GitHub Actions 门禁工作流 (`.github/workflows/deploy.yml`)：

```mermaid
flowchart LR
    Push[Git Push / PR] --> Setup[Node 24 + pnpm 11]
    Setup --> TypeCheck[npx tsc --noEmit]
    TypeCheck --> Lint[npx eslint src]
    Lint --> Test[npx vitest run]
    Test --> Deploy[wrangler deploy Cloudflare Workers]
```
