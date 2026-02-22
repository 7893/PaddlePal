import type { FC, Child } from 'hono/jsx';

export const Layout: FC<{ title: string; children: Child }> = ({ title, children }) => (
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title} - 拍档 PaddlePal</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `tailwind.config={theme:{extend:{colors:{
          emerald:{50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46'},
          teal:{400:'#2dd4bf',500:'#14b8a6'},
          slate:{50:'#f8fafc',100:'#f1f5f9',200:'#e2e8f0',300:'#cbd5e1',400:'#94a3b8',500:'#64748b',600:'#475569',700:'#334155',800:'#1e293b',900:'#0f172a'}
        },fontFamily:{sans:['Inter','Noto Sans SC','system-ui','sans-serif']}}}}` 
      }} />
      <style dangerouslySetInnerHTML={{ __html: `
        body { font-family: 'Inter', 'Noto Sans SC', system-ui, sans-serif; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .card-hover { transition: all .2s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 20px 40px -12px rgba(0,0,0,.1); }
      `}} />
    </head>
    <body class="bg-slate-50 min-h-screen">
      {children}
    </body>
  </html>
);

export const Nav: FC<{ current?: string; title?: string }> = ({ current, title }) => {
  const menu = [
    { href: '/', label: '首页' },
    { href: '/live', label: '实时比分' },
    { href: '/schedule', label: '赛程' },
    { href: '/events', label: '项目' },
    { href: '/stats', label: '统计' },
    { href: '/my', label: '我的比赛' },
  ];
  const adminMenu = [
    { href: '/admin', label: '管理' },
    { href: '/admin/control', label: '控场' },
    { href: '/score', label: '录入' },
  ];
  const isActive = (href: string) => current === href || (href !== '/' && current?.startsWith(href));

  return (
    <div>
      {/* Header */}
      <div class="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900">
        <nav class="border-b border-white/10">
          <div class="max-w-7xl mx-auto px-6">
            <div class="flex items-center justify-between h-16">
              <a href="/" class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <span class="text-white text-lg">🏓</span>
                </div>
                <span class="text-xl font-semibold text-white tracking-tight">拍档</span>
              </a>
              <div class="hidden md:flex items-center gap-1">
                {menu.map(item => (
                  <a href={item.href} class={`px-4 py-2 text-sm rounded-lg transition-colors ${isActive(item.href) ? 'bg-white/20 text-white font-medium' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
                    {item.label}
                  </a>
                ))}
                {adminMenu.map(item => (
                  <a href={item.href} class={`admin-only px-4 py-2 text-sm rounded-lg transition-colors ${isActive(item.href) ? 'bg-emerald-500/30 text-emerald-300 font-medium' : 'text-emerald-400/70 hover:text-emerald-300 hover:bg-white/10'}`} style="display:none">
                    {item.label}
                  </a>
                ))}
              </div>
              <div class="flex items-center gap-3">
                <div id="user-info" class="hidden items-center gap-3">
                  <span class="text-sm text-white/70">👤 管理员</span>
                  <a href="/logout" class="text-sm text-white/50 hover:text-red-400">退出</a>
                </div>
                <a href="/login" id="login-btn" class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg border border-white/20">登录</a>
                <button class="md:hidden p-2 text-white/70" onclick="document.getElementById('mobile-menu').classList.toggle('hidden')">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </nav>
        {/* Page title */}
        {title && (
          <div class="max-w-7xl mx-auto px-6 py-8">
            <h1 class="text-2xl md:text-3xl font-bold text-white">{title}</h1>
          </div>
        )}
        {/* Mobile menu */}
        <div id="mobile-menu" class="hidden md:hidden border-t border-white/10">
          <div class="px-4 py-3 space-y-1">
            {menu.map(item => (
              <a href={item.href} class={`block px-4 py-2 rounded-lg text-sm ${isActive(item.href) ? 'bg-white/20 text-white' : 'text-white/70'}`}>{item.label}</a>
            ))}
            {adminMenu.map(item => (
              <a href={item.href} class={`admin-only block px-4 py-2 rounded-lg text-sm ${isActive(item.href) ? 'bg-emerald-500/30 text-emerald-300' : 'text-emerald-400/70'}`} style="display:none">{item.label}</a>
            ))}
          </div>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  if(document.cookie.indexOf('logged_in=')!==-1){
    var b=document.getElementById('login-btn'),u=document.getElementById('user-info');
    if(b)b.style.display='none';if(u)u.style.display='flex';
    document.querySelectorAll('.admin-only').forEach(function(e){e.style.display='';});
  }
})();
      `}} />
    </div>
  );
};

export const PageWrapper: FC<{ children: Child }> = ({ children }) => (
  <div class="max-w-7xl mx-auto px-6 py-8">
    {children}
  </div>
);

export const Card: FC<{ title?: string; children: Child; class?: string; hover?: boolean }> = (props) => (
  <div class={`bg-white rounded-2xl shadow-sm border border-slate-200/60 ${props.hover !== false ? 'card-hover' : ''} ${props.class || ''}`}>
    {props.title && <div class="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">{props.title}</div>}
    <div class="p-6">{props.children}</div>
  </div>
);

export const Badge: FC<{ color: string; children: Child }> = ({ color, children }) => {
  const colors: Record<string, string> = {
    green: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20',
    yellow: 'bg-amber-100 text-amber-700 ring-1 ring-amber-600/20',
    red: 'bg-rose-100 text-rose-700 ring-1 ring-rose-600/20',
    gray: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20',
    blue: 'bg-sky-100 text-sky-700 ring-1 ring-sky-600/20',
  };
  return <span class={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${colors[color] || colors.gray}`}>{children}</span>;
};

export const Table: FC<{ children: Child }> = ({ children }) => (
  <div class="overflow-x-auto rounded-xl border border-slate-200">
    <table class="min-w-full divide-y divide-slate-200">
      {children}
    </table>
  </div>
);

export const Th: FC<{ children: Child; class?: string }> = ({ children, class: cls }) => (
  <th class={`px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50 ${cls || ''}`}>{children}</th>
);

export const Td: FC<{ children: Child; class?: string }> = ({ children, class: cls }) => (
  <td class={`px-4 py-3 text-sm text-slate-700 ${cls || ''}`}>{children}</td>
);

export const Button: FC<{ href?: string; type?: 'button' | 'submit' | 'reset'; color?: string; children: Child; class?: string }> = ({ href, type, color = 'primary', children, class: cls }) => {
  const colors: Record<string, string> = {
    primary: 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white',
  };
  const base = `inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${colors[color]} ${cls || ''}`;
  if (href) return <a href={href} class={base}>{children}</a>;
  return <button type={type || 'button'} class={base}>{children}</button>;
};

export const Footer: FC = () => (
  <footer class="bg-slate-900 text-white/60 py-10 mt-16">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
            <span class="text-white">🏓</span>
          </div>
          <span class="text-white font-medium">拍档 PaddlePal</span>
        </div>
        <div class="flex gap-6 text-sm">
          <a href="/help" class="hover:text-white">帮助</a>
          <a href="/about" class="hover:text-white">关于</a>
          <a href="/qr" class="hover:text-white">扫码入口</a>
        </div>
      </div>
    </div>
  </footer>
);


export const PageHeader: FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-slate-800">{title}</h1>
    {subtitle && <p class="text-slate-500 mt-1">{subtitle}</p>}
  </div>
);

export const EmptyState: FC<{ icon?: string; message?: string; title?: string; description?: string }> = ({ icon = '📭', message, title, description }) => (
  <div class="bg-white rounded-2xl border border-slate-200 p-12 text-center">
    <div class="text-5xl mb-4 opacity-50">{icon}</div>
    <p class="text-slate-400">{message || title}</p>
    {description && <p class="text-slate-400 text-sm mt-1">{description}</p>}
  </div>
);
