import type { FC, Child } from 'hono/jsx';

export const Layout: FC<{ title: string; children: Child }> = ({ title, children }) => (
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title} - 拍档 PaddlePal</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `tailwind.config={theme:{extend:{colors:{
          pp:{50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46'},
          slate:{50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a'}
        },fontFamily:{sans:['Inter','Noto Sans SC','system-ui','sans-serif']},letterSpacing:{tight:'-0.015em'}}}}`
      }} />
      <style dangerouslySetInnerHTML={{ __html: `
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif; font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'; }
        .fade-in { animation: fadeIn .3s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .dropdown { position: relative; }
        .dropdown-menu { position: absolute; left: 50%; transform: translateX(-50%) translateY(-6px); top: 100%; padding-top: 8px; opacity: 0; visibility: hidden; transition: all .2s cubic-bezier(.4,0,.2,1); pointer-events: none; }
        .dropdown:hover .dropdown-menu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); pointer-events: auto; }
        .glass { background: rgba(255,255,255,.85); backdrop-filter: saturate(180%) blur(20px); -webkit-backdrop-filter: saturate(180%) blur(20px); }
        .card-hover { transition: all .2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px -12px rgba(0,0,0,.1); }
        .gradient-text { background: linear-gradient(135deg, #059669 0%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}} />
    </head>
    <body class="bg-gradient-to-br from-slate-50 via-white to-slate-50 min-h-screen text-slate-600">
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
      { href: '/admin/draw', label: '抽签编排' },
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
    <nav class="glass sticky top-0 z-40 border-b border-slate-200/50">
      <div class="max-w-7xl mx-auto px-4 md:px-8">
        <div class="flex items-center justify-between h-14 md:h-16">
          <a href="/" class="flex items-center gap-2 md:gap-2.5 group">
            <div class="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-gradient-to-br from-pp-400 to-pp-600 flex items-center justify-center shadow-lg shadow-pp-500/25 group-hover:shadow-pp-500/40 transition-shadow">
              <span class="text-white text-sm md:text-base">🏓</span>
            </div>
            <span class="font-semibold text-slate-800 tracking-tight text-sm md:text-base">拍档</span>
          </a>
          
          {/* Desktop menu */}
          <div class="hidden md:flex items-center gap-1">
            {menu.map(g => (
              <div class="dropdown">
                <button class="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100/70 transition-all duration-200">
                  {g.group}
                  <svg class="inline-block w-3.5 h-3.5 ml-1.5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div class="dropdown-menu z-50">
                  <div class="bg-white/95 backdrop-blur-xl rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200/50 py-2 min-w-[160px] overflow-hidden">
                    {g.items.map(l => (
                      <a href={l.href}
                        class={`block px-4 py-2.5 text-sm transition-all duration-150 ${isActive(l.href) ? 'bg-pp-50 text-pp-700 font-medium' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:pl-5'}`}>
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <button class="md:hidden p-2 text-slate-500 hover:text-slate-800" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div id="mobile-menu" class="hidden md:hidden pb-4">
          {menu.map(g => (
            <div class="mb-3">
              <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">{g.group}</div>
              <div class="space-y-0.5">
                {g.items.map(l => (
                  <a href={l.href}
                    class={`block px-3 py-2 rounded-lg text-sm ${isActive(l.href) ? 'bg-pp-50 text-pp-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export const Card: FC<{ title?: string; children: Child; class?: string; hover?: boolean }> = (props) => (
  <div class={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm shadow-slate-100/80 border border-slate-200/40 ${props.hover !== false ? 'card-hover' : ''} ${props.class || ''}`}>
    {props.title && <div class="px-6 py-4 border-b border-slate-100/80 text-[15px] font-medium text-slate-800 tracking-tight">{props.title}</div>}
    <div class="p-6">{props.children}</div>
  </div>
);

export const Badge: FC<{ color: string; children: Child }> = ({ color, children }) => {
  const colors: Record<string, string> = {
    green: 'bg-emerald-50/80 text-emerald-600 ring-1 ring-inset ring-emerald-500/20',
    yellow: 'bg-amber-50/80 text-amber-600 ring-1 ring-inset ring-amber-500/20',
    red: 'bg-rose-50/80 text-rose-600 ring-1 ring-inset ring-rose-500/20',
    gray: 'bg-slate-50/80 text-slate-500 ring-1 ring-inset ring-slate-500/10',
    blue: 'bg-sky-50/80 text-sky-600 ring-1 ring-inset ring-sky-500/20',
  };
  return <span class={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${colors[color] || colors.gray}`}>{children}</span>;
};

export const Table: FC<{ children: Child }> = ({ children }) => (
  <div class="overflow-x-auto rounded-xl border border-slate-200/50">
    <table class="w-full text-[13px]">
      {children}
    </table>
  </div>
);

export const Th: FC<{ children: Child; class?: string }> = ({ children, class: cls }) => (
  <th class={`px-4 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/80 first:rounded-tl-xl last:rounded-tr-xl ${cls || ''}`}>{children}</th>
);

export const Td: FC<{ children: Child; class?: string }> = ({ children, class: cls }) => (
  <td class={`px-4 py-3.5 text-slate-600 border-t border-slate-100/80 ${cls || ''}`}>{children}</td>
);

export const Button: FC<{ href?: string; type?: string; variant?: string; size?: string; children: Child; class?: string }> = (props) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200';
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-pp-500 to-pp-600 text-white hover:from-pp-600 hover:to-pp-700 shadow-lg shadow-pp-500/25 hover:shadow-pp-500/40 hover:-translate-y-0.5',
    secondary: 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80 hover:-translate-y-0.5',
    ghost: 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/60',
    danger: 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-lg shadow-rose-500/25',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
  };
  const cls = `${base} ${variants[props.variant || 'primary']} ${sizes[props.size || 'md']} ${props.class || ''}`;
  
  if (props.href) return <a href={props.href} class={cls}>{props.children}</a>;
  return <button type={(props.type as 'button' | 'submit' | 'reset') || 'button'} class={cls}>{props.children}</button>;
};

export const PageHeader: FC<{ title: string; subtitle?: string; children?: Child }> = ({ title, subtitle, children }) => (
  <div class="mb-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p class="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children && <div class="flex items-center gap-3">{children}</div>}
    </div>
  </div>
);

export const EmptyState: FC<{ icon?: string; title: string; description?: string }> = ({ icon, title, description }) => (
  <div class="text-center py-16">
    {icon && <div class="text-4xl mb-4 opacity-40">{icon}</div>}
    <h3 class="text-sm font-medium text-slate-500">{title}</h3>
    {description && <p class="mt-1 text-xs text-slate-400">{description}</p>}
  </div>
);
