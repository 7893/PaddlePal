# PaddlePal 拍档

Table Tennis Tournament Management System — Cloudflare Workers + D1

## Stack

- **Runtime**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Frontend**: Static HTML + jQuery (served via Workers Assets)

## Development

```bash
npm install
npm run db:init:local   # init local D1
npm run dev             # start local dev server
```

## Deploy

```bash
npm run db:init         # init remote D1 (first time)
npm run deploy          # deploy to Cloudflare
```

## Migrated from

Original Windows desktop app "乒乓球助手" (SSZS, 2018) → Go rewrite → Cloudflare Workers
