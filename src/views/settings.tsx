import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

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
    <Nav current="/admin/settings" title="系统设置" />
    <PageWrapper>
      <div class="max-w-2xl mx-auto">
        <Card title="比赛设置" class="mb-6">
          <div class="space-y-5">
            <div class="flex items-center justify-between">
              <label class="text-slate-700 font-medium">球台数量</label>
              <select
                id="tables_count"
                class="border border-slate-200 rounded-xl px-4 py-2.5 w-36 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {[4, 6, 8, 10, 12, 16, 20].map((n) => (
                  <option value={n} selected={settings.tables_count === n}>
                    {n} 台
                  </option>
                ))}
              </select>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-slate-700 font-medium">每场时长</label>
              <select
                id="minutes_per_match"
                class="border border-slate-200 rounded-xl px-4 py-2.5 w-36 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {[10, 15, 20, 25, 30, 45, 60].map((n) => (
                  <option value={n} selected={settings.minutes_per_match === n}>
                    {n} 分钟
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card title="功能开关" class="mb-6">
          <div class="space-y-5">
            <label class="flex items-center justify-between cursor-pointer group">
              <span class="text-slate-700">比分录入后自动跳转下一场</span>
              <div class="relative">
                <input type="checkbox" id="auto_advance" checked={!!settings.auto_advance} class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
              </div>
            </label>
            <label class="flex items-center justify-between cursor-pointer group">
              <span class="text-slate-700">成绩需裁判长确认</span>
              <div class="relative">
                <input type="checkbox" id="require_confirm" checked={!!settings.require_confirm} class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
              </div>
            </label>
            <label class="flex items-center justify-between cursor-pointer group">
              <span class="text-slate-700">允许选手申诉</span>
              <div class="relative">
                <input type="checkbox" id="allow_appeals" checked={!!settings.allow_appeals} class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
              </div>
            </label>
            <label class="flex items-center justify-between cursor-pointer group">
              <span class="text-slate-700">显示选手积分</span>
              <div class="relative">
                <input type="checkbox" id="show_rating" checked={!!settings.show_rating} class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-500 transition-colors"></div>
                <div class="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
              </div>
            </label>
          </div>
        </Card>

        <button
          onclick="saveSettings()"
          class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all"
        >
          保存设置
        </button>
      </div>
    </PageWrapper>
    <Footer />

    <script
      dangerouslySetInnerHTML={{
        __html: `
function saveSettings() {
  var data = {
    tables_count: parseInt(document.getElementById('tables_count').value),
    minutes_per_match: parseInt(document.getElementById('minutes_per_match').value),
    auto_advance: document.getElementById('auto_advance').checked ? 1 : 0,
    require_confirm: document.getElementById('require_confirm').checked ? 1 : 0,
    allow_appeals: document.getElementById('allow_appeals').checked ? 1 : 0,
    show_rating: document.getElementById('show_rating').checked ? 1 : 0
  };
  fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(r => r.json()).then(res => { if (res.success) alert('设置已保存'); else alert('错误: ' + res.error); });
}
`,
      }}
    />
  </Layout>
);
