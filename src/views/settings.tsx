import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, Select, Button, Toggle } from '../components/layout';

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
              <Select id="tables_count" class="w-36">
                {[4, 6, 8, 10, 12, 16, 20].map((n) => (
                  <option value={n} selected={settings.tables_count === n}>
                    {n} 台
                  </option>
                ))}
              </Select>
            </div>
            <div class="flex items-center justify-between">
              <label class="text-slate-700 font-medium">每场时长</label>
              <Select id="minutes_per_match" class="w-36">
                {[10, 15, 20, 25, 30, 45, 60].map((n) => (
                  <option value={n} selected={settings.minutes_per_match === n}>
                    {n} 分钟
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </Card>
        <Card title="功能开关" class="mb-6">
          <div class="space-y-5">
            <Toggle id="auto_advance" checked={!!settings.auto_advance} label="比分录入后自动跳转下一场" />
            <Toggle id="require_confirm" checked={!!settings.require_confirm} label="成绩需裁判长确认" />
            <Toggle id="allow_appeals" checked={!!settings.allow_appeals} label="允许选手申诉" />
            <Toggle id="show_rating" checked={!!settings.show_rating} label="显示选手积分" />
          </div>
        </Card>
        <Button onclick="saveSettings()" class="w-full py-3.5">
          保存设置
        </Button>
      </div>
    </PageWrapper>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `function saveSettings(){var d={tables_count:+document.getElementById('tables_count').value,minutes_per_match:+document.getElementById('minutes_per_match').value,auto_advance:document.getElementById('auto_advance').checked?1:0,require_confirm:document.getElementById('require_confirm').checked?1:0,allow_appeals:document.getElementById('allow_appeals').checked?1:0,show_rating:document.getElementById('show_rating').checked?1:0};fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)}).then(r=>r.json()).then(res=>{if(res.success)alert('设置已保存');else alert('错误: '+res.error)})}`,
      }}
    />
  </Layout>
);
