import type { FC } from 'hono/jsx';
import {
  Layout,
  Nav,
  Card,
  PageWrapper,
  Footer,
  Select,
  Input,
  Button,
  EmptyState,
  FormGroup,
} from '../components/layout';

type Match = {
  id: number;
  pid: number;
  round: number;
  time: string;
  table_no: number;
  p1: string;
  p2: string;
  status: string;
};

export const ScheduleManagePage: FC<{ eventKey: string; eventTitle: string; matches: Match[]; tableCount: number }> = ({
  eventKey,
  eventTitle,
  matches,
  tableCount,
}) => {
  const byTime: Record<string, Match[]> = {};
  for (const m of matches) {
    if (!byTime[m.time]) byTime[m.time] = [];
    byTime[m.time].push(m);
  }
  const times = Object.keys(byTime).sort();

  return (
    <Layout title={`赛程编排 - ${eventTitle}`}>
      <Nav current="/admin/schedule" title={`赛程编排 · ${eventTitle}`} />
      <PageWrapper>
        <Card title="生成赛程" class="mb-6">
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FormGroup label="球台数">
              <Select id="tableCount" class="w-full">
                {[4, 6, 8, 10, 12].map((n) => (
                  <option value={n} selected={n === 6}>
                    {n}台
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="开始时间">
              <Input type="time" id="startTime" value="08:30" class="w-full" />
            </FormGroup>
            <FormGroup label="每场分钟">
              <Select id="minutesPerMatch" class="w-full">
                {[10, 15, 20, 25, 30].map((n) => (
                  <option value={n} selected={n === 15}>
                    {n}分钟
                  </option>
                ))}
              </Select>
            </FormGroup>
            <div class="flex items-end gap-2">
              <button
                onclick="generateRoundRobin()"
                class="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600"
              >
                循环赛
              </button>
              <button
                onclick="generateKnockout()"
                class="flex-1 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600"
              >
                淘汰赛
              </button>
            </div>
            <div class="flex items-end">
              <Button onclick="clearSchedule()" color="danger" class="w-full">
                清除
              </Button>
            </div>
          </div>
        </Card>

        {matches.length > 0 ? (
          <Card title={`赛程表 (${matches.length}场)`}>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200">
                    <th class="text-left py-3 px-3 text-slate-500 font-semibold">时间</th>
                    {Array.from({ length: tableCount }, (_, i) => (
                      <th class="text-center py-3 px-3 text-slate-500 font-semibold">{i + 1}台</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {times.map((time) => (
                    <tr class="border-b border-slate-100 hover:bg-slate-50">
                      <td class="py-3 px-3 font-mono text-slate-600 font-medium">{time}</td>
                      {Array.from({ length: tableCount }, (_, i) => {
                        const m = byTime[time]?.find((x) => x.table_no === i + 1);
                        return (
                          <td class="py-3 px-3 text-center">
                            {m ? (
                              <div
                                class={`text-xs rounded-lg px-2 py-1.5 ${m.status === 'finished' ? 'bg-emerald-100 text-emerald-700' : m.status === 'playing' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {m.p1 || '?'} vs {m.p2 || '?'}
                              </div>
                            ) : (
                              <span class="text-slate-300">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <EmptyState icon="📅" title="暂无赛程，请先生成" />
        )}
        <div class="mt-6 text-center text-slate-500">共 {matches.length} 场比赛</div>
      </PageWrapper>
      <Footer />
      <script
        dangerouslySetInnerHTML={{
          __html: `var ek='${eventKey}';function api(u,b){return fetch(u,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json())}function generateRoundRobin(){if(!confirm('生成循环赛赛程？'))return;api('/api/schedule/'+ek+'/roundrobin',{tableCount:+document.getElementById('tableCount').value,startTime:document.getElementById('startTime').value,minutesPerMatch:+document.getElementById('minutesPerMatch').value}).then(r=>{if(r.success){alert('生成完成！共 '+r.matchCount+' 场');location.reload()}else alert('错误: '+r.error)})}function generateKnockout(){var n=prompt('参赛人数:','8');if(!n)return;api('/api/schedule/'+ek+'/knockout',{playerCount:+n,tableCount:+document.getElementById('tableCount').value,startTime:document.getElementById('startTime').value,minutesPerMatch:+document.getElementById('minutesPerMatch').value}).then(r=>{if(r.success){alert('生成完成！共 '+r.matchCount+' 场');location.reload()}else alert('错误: '+r.error)})}function clearSchedule(){if(!confirm('确定清除？'))return;api('/api/schedule/'+ek+'/clear',{}).then(r=>{if(r.success)location.reload()})}`,
        }}
      />
    </Layout>
  );
};
