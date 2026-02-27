import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type ExportOptions = {
  events: { key: string; title: string }[];
  tournament: { name: string; venue: string; date: string };
};

export const ExportPage: FC<ExportOptions> = ({ events, tournament }) => (
  <Layout title="导出中心">
    <Nav current="/admin" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-800">📤 导出中心</h2>
        <p class="text-sm text-gray-500 mt-1">导出成绩、记分单、秩序册等</p>
      </div>

      {/* Quick exports */}
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button
          onclick="exportAll('players')"
          class="p-4 bg-white rounded-xl border border-gray-200 hover:border-pp-300 hover:shadow-md transition text-center"
        >
          <div class="text-2xl mb-2">👥</div>
          <div class="text-sm font-medium text-gray-700">选手名单</div>
          <div class="text-xs text-gray-400">CSV</div>
        </button>
        <button
          onclick="exportAll('results')"
          class="p-4 bg-white rounded-xl border border-gray-200 hover:border-pp-300 hover:shadow-md transition text-center"
        >
          <div class="text-2xl mb-2">🏆</div>
          <div class="text-sm font-medium text-gray-700">全部成绩</div>
          <div class="text-xs text-gray-400">CSV</div>
        </button>
        <button
          onclick="exportAll('schedule')"
          class="p-4 bg-white rounded-xl border border-gray-200 hover:border-pp-300 hover:shadow-md transition text-center"
        >
          <div class="text-2xl mb-2">📅</div>
          <div class="text-sm font-medium text-gray-700">赛程表</div>
          <div class="text-xs text-gray-400">CSV</div>
        </button>
        <button
          onclick="exportAll('ratings')"
          class="p-4 bg-white rounded-xl border border-gray-200 hover:border-pp-300 hover:shadow-md transition text-center"
        >
          <div class="text-2xl mb-2">📊</div>
          <div class="text-sm font-medium text-gray-700">积分变动</div>
          <div class="text-xs text-gray-400">CSV</div>
        </button>
      </div>

      {/* Score sheets */}
      <Card title="📝 记分单生成">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">选择项目</label>
            <select
              id="eventSelect"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pp-500 focus:border-pp-500"
            >
              <option value="">全部项目</option>
              {events.map((e) => (
                <option value={e.key}>{e.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">记分单样式</label>
            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-pp-300 has-[:checked]:border-pp-500 has-[:checked]:bg-pp-50">
                <input type="radio" name="style" value="simple" checked class="text-pp-600" />
                <div>
                  <div class="text-sm font-medium text-gray-700">简易记分单</div>
                  <div class="text-xs text-gray-400">适合基层比赛</div>
                </div>
              </label>
              <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-pp-300 has-[:checked]:border-pp-500 has-[:checked]:bg-pp-50">
                <input type="radio" name="style" value="ctta" class="text-pp-600" />
                <div>
                  <div class="text-sm font-medium text-gray-700">CTTA标准</div>
                  <div class="text-xs text-gray-400">中国乒协标准</div>
                </div>
              </label>
              <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-pp-300 has-[:checked]:border-pp-500 has-[:checked]:bg-pp-50">
                <input type="radio" name="style" value="ittf" class="text-pp-600" />
                <div>
                  <div class="text-sm font-medium text-gray-700">ITTF标准</div>
                  <div class="text-xs text-gray-400">国际乒联标准</div>
                </div>
              </label>
              <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-pp-300 has-[:checked]:border-pp-500 has-[:checked]:bg-pp-50">
                <input type="radio" name="style" value="booth" class="text-pp-600" />
                <div>
                  <div class="text-sm font-medium text-gray-700">包台记分单</div>
                  <div class="text-xs text-gray-400">适合包台比赛</div>
                </div>
              </label>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              onclick="generateScoreSheet()"
              class="flex-1 py-2.5 bg-pp-600 text-white rounded-lg font-medium hover:bg-pp-700 transition"
            >
              生成记分单 (Excel)
            </button>
            <button
              onclick="printScoreSheet()"
              class="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              🖨️ 打印
            </button>
          </div>
        </div>
      </Card>

      {/* Program book */}
      <Card title="📖 秩序册" class="mt-6">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">赛事名称</label>
              <input
                type="text"
                id="progName"
                value={tournament.name}
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">比赛地点</label>
              <input
                type="text"
                id="progVenue"
                value={tournament.venue}
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div class="flex flex-wrap gap-2">
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked class="text-pp-600" id="incPlayers" /> 选手名单
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked class="text-pp-600" id="incSchedule" /> 赛程表
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked class="text-pp-600" id="incDraw" /> 签表
            </label>
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" class="text-pp-600" id="incRules" /> 竞赛规程
            </label>
          </div>
          <button
            onclick="generateProgram()"
            class="w-full py-2.5 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition"
          >
            生成秩序册 (PDF)
          </button>
        </div>
      </Card>
    </div>

    <script
      dangerouslySetInnerHTML={{
        __html: `
function exportAll(type) {
  window.location.href = '/api/export/' + type + '?format=csv';
}

function generateScoreSheet() {
  var event = document.getElementById('eventSelect').value;
  var style = document.querySelector('input[name="style"]:checked').value;
  window.location.href = '/api/export/scoresheet?event=' + event + '&style=' + style;
}

function printScoreSheet() {
  var event = document.getElementById('eventSelect').value;
  var style = document.querySelector('input[name="style"]:checked').value;
  window.open('/api/export/scoresheet?event=' + event + '&style=' + style + '&print=1', '_blank');
}

function generateProgram() {
  var params = new URLSearchParams({
    name: document.getElementById('progName').value,
    venue: document.getElementById('progVenue').value,
    players: document.getElementById('incPlayers').checked,
    schedule: document.getElementById('incSchedule').checked,
    draw: document.getElementById('incDraw').checked,
    rules: document.getElementById('incRules').checked
  });
  window.location.href = '/api/export/program?' + params.toString();
}
`,
      }}
    />
  </Layout>
);

// Printable score sheet component
export const ScoreSheetPrint: FC<{
  matches: {
    pid: number;
    p1: string;
    p2: string;
    t1: string;
    t2: string;
    event: string;
    table: number;
    time: string;
    bestOf: number;
  }[];
  tournament: { name: string; venue: string; date: string };
}> = ({ matches, tournament }) => (
  <html>
    <head>
      <meta charset="utf-8" />
      <title>记分单 - {tournament.name}</title>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page { size: A4; margin: 10mm; }
        @media print { .no-print { display: none; } .page-break { page-break-after: always; } }
        body { font-family: 'SimSun', serif; font-size: 12pt; }
        .sheet { border: 1px solid #000; padding: 15px; margin-bottom: 20px; }
        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        .title { font-size: 16pt; font-weight: bold; }
        .info { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10pt; }
        .players { display: flex; justify-content: space-between; margin: 20px 0; }
        .player { text-align: center; width: 45%; }
        .player-name { font-size: 14pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5px; }
        .player-team { font-size: 10pt; color: #666; margin-top: 5px; }
        .scores { margin: 20px 0; }
        .scores table { width: 100%; border-collapse: collapse; }
        .scores th, .scores td { border: 1px solid #000; padding: 8px; text-align: center; }
        .scores th { background: #f0f0f0; }
        .result { text-align: center; margin-top: 20px; }
        .result-box { display: inline-block; border: 2px solid #000; padding: 10px 30px; font-size: 18pt; font-weight: bold; }
        .signature { display: flex; justify-content: space-between; margin-top: 30px; font-size: 10pt; }
        .sig-line { border-top: 1px solid #000; width: 100px; display: inline-block; }
      `,
        }}
      />
    </head>
    <body>
      <div class="no-print" style="padding:10px;background:#f0f0f0;margin-bottom:20px;">
        <button onclick="window.print()" style="padding:10px 20px;font-size:14pt;">
          🖨️ 打印
        </button>
        <button onclick="window.close()" style="padding:10px 20px;font-size:14pt;margin-left:10px;">
          关闭
        </button>
      </div>
      {matches.map((m, i) => (
        <div class={`sheet ${i < matches.length - 1 ? 'page-break' : ''}`}>
          <div class="header">
            <div class="title">{tournament.name}</div>
            <div style="font-size:10pt;margin-top:5px;">
              {tournament.venue} · {tournament.date}
            </div>
          </div>
          <div class="info">
            <span>场次: #{m.pid}</span>
            <span>项目: {m.event}</span>
            <span>球台: {m.table}号</span>
            <span>时间: {m.time}</span>
          </div>
          <div class="players">
            <div class="player">
              <div class="player-name">{m.p1}</div>
              <div class="player-team">{m.t1}</div>
            </div>
            <div style="font-size:20pt;align-self:center;">VS</div>
            <div class="player">
              <div class="player-name">{m.p2}</div>
              <div class="player-team">{m.t2}</div>
            </div>
          </div>
          <div class="scores">
            <table>
              <thead>
                <tr>
                  <th style="width:60px;">局</th>
                  {Array.from({ length: m.bestOf }, (_, j) => (
                    <th>第{j + 1}局</th>
                  ))}
                  <th style="width:80px;">局分</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{m.p1}</td>
                  {Array.from({ length: m.bestOf }, () => (
                    <td style="height:40px;"></td>
                  ))}
                  <td></td>
                </tr>
                <tr>
                  <td>{m.p2}</td>
                  {Array.from({ length: m.bestOf }, () => (
                    <td style="height:40px;"></td>
                  ))}
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="result">
            <div class="result-box">______ : ______</div>
          </div>
          <div class="signature">
            <div>
              裁判员签名: <span class="sig-line"></span>
            </div>
            <div>
              选手签名: <span class="sig-line"></span> / <span class="sig-line"></span>
            </div>
          </div>
        </div>
      ))}
    </body>
  </html>
);
