import type { FC, Child } from 'hono/jsx';

export const Layout: FC<{ title: string; children: Child }> = ({ title, children }) => (
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title} - 拍档 PaddlePal</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
      <script dangerouslySetInnerHTML={{
        __html: `tailwind.config={theme:{extend:{colors:{pp:{50:'#f0fdf4',100:'#dcfce7',500:'#22c55e',600:'#16a34a',700:'#15803d',800:'#166534'}}}}}`
      }} />
      <style dangerouslySetInnerHTML={{
        __html: `body{font-family:system-ui,-apple-system,sans-serif} .fade-in{animation:fadeIn .3s ease-in} @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`
      }} />
    </head>
    <body class="bg-gray-50 min-h-screen">
      {children}
    </body>
  </html>
);

export const Nav: FC<{ current?: string }> = ({ current }) => {
  const menu = [
    { group: '赛事', items: [
      { href: '/', label: '首页', icon: '🏠' },
      { href: '/live', label: '实时比分', icon: '🏓' },
      { href: '/schedule', label: '赛程', icon: '📋' },
      { href: '/results', label: '成绩', icon: '🏆' },
      { href: '/ranking', label: '积分榜', icon: '📊' },
      { href: '/players', label: '选手', icon: '👥' },
      { href: '/notices', label: '公告', icon: '📢' },
    ]},
    { group: '管理', items: [
      { href: '/admin', label: '概览', icon: '📈' },
      { href: '/admin/tournament', label: '赛事设置', icon: '⚙️' },
      { href: '/admin/events', label: '项目', icon: '🎯' },
      { href: '/admin/players', label: '选手', icon: '👤' },
      { href: '/admin/teams', label: '队伍', icon: '🚩' },
      { href: '/admin/flags', label: '队旗', icon: '🎌' },
      { href: '/admin/notices', label: '公告', icon: '📝' },
    ]},
    { group: '大屏', items: [
      { href: '/screen/live', label: '比分大屏', icon: '📺' },
      { href: '/screen/flags', label: '队旗大屏', icon: '🚩' },
      { href: '/screen/results', label: '成绩滚动', icon: '🔄' },
      { href: '/screen/schedule', label: '赛程滚动', icon: '📜' },
    ]},
    { group: '工具', items: [
      { href: '/search', label: '查询', icon: '🔍' },
      { href: '/progress', label: '进度', icon: '📉' },
    ]},
  ];
  
  return (
    <nav class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center h-14">
          <a href="/" class="text-lg font-bold text-pp-700 mr-6">🏓 拍档</a>
          <div class="flex gap-6 overflow-x-auto">
            {menu.map(g => (
              <div class="relative group">
                <button class="px-2 py-2 text-sm text-gray-600 hover:text-pp-700 whitespace-nowrap">
                  {g.group} ▾
                </button>
                <div class="absolute left-0 top-full pt-1 hidden group-hover:block z-50">
                  <div class="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[140px]">
                    {g.items.map(l => (
                      <a href={l.href}
                        class={`block px-4 py-2 text-sm transition ${current === l.href ? 'bg-pp-50 text-pp-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <span class="mr-2">{l.icon}</span>{l.label}
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
  <div class={`bg-white rounded-xl shadow-sm border border-gray-200 ${props.class || ''}`}>
    {props.title && <div class="px-5 py-3 border-b border-gray-100 font-medium text-gray-800">{props.title}</div>}
    <div class="p-5">{props.children}</div>
  </div>
);

export const Badge: FC<{ color: string; children: Child }> = ({ color, children }) => {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-700',
  };
  return <span class={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>{children}</span>;
};
