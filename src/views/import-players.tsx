import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, Select, Textarea, Button } from '../components/layout';

export const ImportPlayersPage: FC<{ teamId?: number; teams: { id: number; name: string }[] }> = ({
  teamId,
  teams,
}) => (
  <Layout title="批量导入选手">
    <Nav current="/import-players" title="批量导入选手" />
    <PageWrapper>
      <div class="max-w-2xl mx-auto">
        <Card title="选择队伍" class="mb-6">
          <Select id="teamId" class="w-full">
            <option value="">-- 个人参赛 --</option>
            {teams.map((t) => (
              <option value={t.id} selected={t.id === teamId}>
                {t.name}
              </option>
            ))}
          </Select>
        </Card>
        <Card title="输入选手名单" class="mb-6">
          <p class="text-sm text-slate-500 mb-3">每行一个选手姓名</p>
          <Textarea
            id="names"
            rows={10}
            placeholder="张三&#10;李四&#10;王五"
            class="w-full font-mono text-sm"
          />
          <div class="mt-4 flex gap-3">
            <Button onclick="importPlayers()">导入</Button>
            <Button onclick="clearText()" color="secondary">
              清空
            </Button>
          </div>
        </Card>
        <Card title="CSV 导入">
          <p class="text-sm text-slate-500 mb-3">格式：姓名,性别,积分</p>
          <input
            type="file"
            id="csvFile"
            accept=".csv"
            class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100"
          />
          <button
            onclick="importCSV()"
            class="mt-4 px-6 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600"
          >
            导入 CSV
          </button>
        </Card>
      </div>
    </PageWrapper>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `function importPlayers(){var t=document.getElementById('teamId').value||null,n=document.getElementById('names').value.split('\\n').map(n=>n.trim()).filter(n=>n);if(!n.length){alert('请输入选手名单');return}fetch('/api/import/players',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({teamId:t?+t:null,players:n.map(n=>({name:n}))})}).then(r=>r.json()).then(res=>{if(res.success){alert('已导入 '+res.count+' 名选手');document.getElementById('names').value=''}else alert('错误: '+res.error)})}function clearText(){document.getElementById('names').value=''}function importCSV(){var f=document.getElementById('csvFile').files[0];if(!f){alert('请选择文件');return}var r=new FileReader();r.onload=function(e){var p=e.target.result.split('\\n').filter(l=>l.trim()).map(l=>{var x=l.split(',');return{name:x[0]?.trim(),gender:x[1]?.trim()||'',rating:+x[2]||0}}).filter(p=>p.name),t=document.getElementById('teamId').value||null;fetch('/api/import/players',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({teamId:t?+t:null,players:p})}).then(r=>r.json()).then(res=>{if(res.success)alert('已导入 '+res.count+' 名选手');else alert('错误: '+res.error)})};r.readAsText(f)}`,
      }}
    />
  </Layout>
);
