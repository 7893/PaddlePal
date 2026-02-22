import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type Settings = {
  tables_count: number;
  minutes_per_match: number;
  auto_advance: number;
  require_confirm: number;
  allow_appeals: number;
  show_rating: number;
};

export const SettingsPage: FC<{ settings: Settings }> = ({ settings }) => (
  <Layout title="系统设置">
    <Nav current="/admin" />
    <div class="max-w-2xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">⚙️ 系统设置</h2>
        <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
      </div>

      <Card title="比赛设置" class="mb-4">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <label class="text-gray-700">球台数量</label>
            <select id="tables_count" class="border border-gray-300 rounded-lg px-3 py-2 w-32">
              {[4, 6, 8, 10, 12].map(n => (
                <option value={n} selected={settings.tables_count === n}>{n} 台</option>
              ))}
            </select>
          </div>
          <div class="flex items-center justify-between">
            <label class="text-gray-700">每场时长（分钟）</label>
            <select id="minutes_per_match" class="border border-gray-300 rounded-lg px-3 py-2 w-32">
              {[10, 15, 20, 25, 30].map(n => (
                <option value={n} selected={settings.minutes_per_match === n}>{n} 分钟</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card title="功能开关" class="mb-4">
        <div class="space-y-4">
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-gray-700">比分录入后自动跳转下一场</span>
            <input type="checkbox" id="auto_advance" checked={!!settings.auto_advance} class="w-5 h-5 text-pp-600 rounded" />
          </label>
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-gray-700">成绩需裁判长确认</span>
            <input type="checkbox" id="require_confirm" checked={!!settings.require_confirm} class="w-5 h-5 text-pp-600 rounded" />
          </label>
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-gray-700">允许选手申诉</span>
            <input type="checkbox" id="allow_appeals" checked={!!settings.allow_appeals} class="w-5 h-5 text-pp-600 rounded" />
          </label>
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-gray-700">显示选手积分</span>
            <input type="checkbox" id="show_rating" checked={!!settings.show_rating} class="w-5 h-5 text-pp-600 rounded" />
          </label>
        </div>
      </Card>

      <button onclick="saveSettings()" class="w-full py-3 bg-pp-600 text-white rounded-lg hover:bg-pp-700 font-medium">
        保存设置
      </button>
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
function saveSettings() {
  var data = {
    tables_count: parseInt(document.getElementById('tables_count').value),
    minutes_per_match: parseInt(document.getElementById('minutes_per_match').value),
    auto_advance: document.getElementById('auto_advance').checked ? 1 : 0,
    require_confirm: document.getElementById('require_confirm').checked ? 1 : 0,
    allow_appeals: document.getElementById('allow_appeals').checked ? 1 : 0,
    show_rating: document.getElementById('show_rating').checked ? 1 : 0
  };

  fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) alert('设置已保存');
    else alert('错误: ' + res.error);
  });
}
`}} />
  </Layout>
);
