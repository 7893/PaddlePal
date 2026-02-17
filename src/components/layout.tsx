import type { FC, Child } from 'hono/jsx';

export const Layout: FC<{ title: string; children: Child }> = ({ title, children }) => (
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title} - 拍档 PaddlePal</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600&display=swap" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `tailwind.config={theme:{extend:{colors:{
          pp:{50:'#f0fdf4',100:'#dcfce7',200:'#bbf7d0',300:'#86efac',400:'#4ade80',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534'},
          slate:{50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b'}
        },fontFamily:{sans:['Inter','Noto Sans SC','system-ui','sans-serif']}}}}` 
      }} />
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif; }
        .fade-in { animation: fadeIn .25s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .dropdown { position: relative; }
        .dropdown-menu { position: absolute; left: 0; top: 100%; padding-top: 4px; opacity: 0; visibility: hidden; transform: translateY(-4px); transition: all .15s ease; }
        .dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateY(0); }
        .glass { background: rgba(255,255,255,.8); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
      `}} />
    </head>
    <body class="bg-slate-50 min-h-screen text-slate-700">
      {children}
    </body>
  </html>
);

export const Nav: FC<{ current?: string }> = ({ current }) => {
  const menu = [
    { group: '赛事', items: [
      { href: '/', label: '首页' },
      { href: '/live', label: '实时比分' },
      { href: '/schedule', label: '赛程安排' },
      { href: '/results', label: '比赛成绩' },
      { href: '/ranking', label: '积分排名' },
      { href: '/players', label: '参赛选手' },
      { href: '/notices', label: '赛事公告' },
    ]},
    { group: '管理', items: [
      { href: '/admin', label: '管理概览' },
      { href: '/admin/tournament', label: '赛事设置' },
      { href: '/admin/events', label: '项目管理' },
      { href: '/admin/players', label: '选手管理' },
      { href: '/admin/teams', label: '队伍管理' },
      { href: '/admin/flags', label: '队旗管理' },
      { href: '/admin/notices', label: '公告管理' },
    ]},
    { group: '大屏', items: [
      { href: '/screen/live', label: '比分直播' },
      { href: '/screen/flags', label: '队旗展示' },
      { href: '/screen/results', label: '成绩轮播' },
      { href: '/screen/schedule', label: '赛程轮播' },
    ]},
    { group: '工具', items: [
      { href: '/search', label: '综合查询' },
      { href: '/progress', label: '赛事进度' },
    ]},
  ];
  
  const isActive = (href: string) => current === href || (href !== '/' && current?.startsWith(href));
  
  return (
    <nav class="glass sticky top-0 z-40 border-b border-slate-200/60">
      <div class="max-w-6xl mx-auto px-6">
        <div class="flex items-center h-14">
          <a href="/" class="flex items-center gap-2 mr-8">
            <span class="text-xl">🏓</span>
            <span class="font-semibold text-slate-800 tracking-tight">拍档</span>
          </a>
          <div class="flex items-center gap-1">
            {menu.map(g => (
              <div class="dropdown">
                <button class="px-3 py-2 text-[13px] text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100/60 transition-colors">
                  {g.group}
                  <svg class="inline-block w-3 h-3 ml-1 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div class="dropdown-menu z-50">
                  <div class="bg-white rounded-lg shadow-lg shadow-slate-200/50 border border-slate-200/60 py-1.5 min-w-[150px]">
                    {g.items.map(l => (
                      <a href={l.href}
                        class={`block px-3.5 py-2 text-[13px] transition-colors ${isActive(l.href) ? 'bg-pp-50 text-pp-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}>
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export const Card: FC<{ title?: string; children: Child; class?: string }> = (props) => (
  <div class={`bg-white rounded-xl shadow-sm shadow-slate-100 border border-slate-200/60 ${props.class || ''}`}>
    {props.title && <div class="px-5 py-3.5 border-b border-slate-100 text-[15px] font-medium text-slate-800">{props.title}</div>}
    <div class="p-5">{props.children}</div>
  </div>
);

export const Badge: FC<{ color: string; children: Child }> = ({ color, children }) => {
  const colors: Record<string, string> = {
    green: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20',
    yellow: 'bg-amber-50 text-amber-600 ring-1 ring-amber-500/20',
    red: 'bg-rose-50 text-rose-600 ring-1 ring-rose-500/20',
    gray: 'bg-slate-50 text-slate-500 ring-1 ring-slate-500/10',
    blue: 'bg-sky-50 text-sky-600 ring-1 ring-sky-500/20',
  };
  return <span class={`inline-block px-2 py-0.5 rounded-md text-xs font-medium ${colors[color] || colors.gray}`}>{children}</span>;
};

export const Table: FC<{ children: Child }> = ({ children }) => (
  <div class="overflow-x-auto">
    <table class="w-full text-[13px]">
      {children}
    </table>
  </div>
);

export const Th: FC<{ children: Child; class?: string }> = ({ children, class: cls }) => (
  <th class={`px-3 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider bg-slate-50/50 ${cls || ''}`}>{children}</th>
);

export const Td: FC<{ children: Child; class?: string }> = ({ children, class: cls }) => (
  <td class={`px-3 py-3 text-slate-600 border-t border-slate-100 ${cls || ''}`}>{children}</td>
);

export const Button: FC<{ href?: string; type?: string; variant?: string; size?: string; children: Child; class?: string }> = (props) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-all';
  const variants: Record<string, string> = {
    primary: 'bg-pp-500 text-white hover:bg-pp-600 shadow-sm shadow-pp-500/25',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    ghost: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm shadow-rose-500/25',
  };
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  };
  const cls = `${base} ${variants[props.variant || 'primary']} ${sizes[props.size || 'md']} ${props.class || ''}`;
  
  if (props.href) return <a href={props.href} class={cls}>{props.children}</a>;
  return <button type={(props.type as 'button' | 'submit' | 'reset') || 'button'} class={cls}>{props.children}</button>;
};
