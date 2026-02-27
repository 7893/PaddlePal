import { Layout, Nav, Card, Badge, Table, Th, Td, EmptyState, PageWrapper, Footer } from '../components/layout';

export const RankingPage = ({ players }: { players: any[] }) => (
  <Layout title="积分排名">
    <Nav current="/ranking" title="积分排名" />
    <PageWrapper>
      <p class="text-slate-500 mb-6">共 {players.length} 名选手</p>
      <Card hover={false}>
        {players.length > 0 ? (
          <Table>
            <thead>
              <tr>
                <Th class="w-16">排名</Th>
                <Th>选手</Th>
                <Th>队伍</Th>
                <Th class="text-right">积分</Th>
              </tr>
            </thead>
            <tbody>
              {players.map((p: any, i: number) => (
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <Td>
                    {i < 3 ? (
                      <span
                        class={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : 'bg-orange-100 text-orange-700'}`}
                      >
                        {i + 1}
                      </span>
                    ) : (
                      <span class="text-slate-400 pl-2">{i + 1}</span>
                    )}
                  </Td>
                  <Td class="font-medium text-slate-800">{p.name}</Td>
                  <Td>{p.team || <span class="text-slate-300">-</span>}</Td>
                  <Td class="text-right">
                    <span class="font-semibold text-emerald-600">{p.rating}</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon="🏆" title="暂无排名数据" />
        )}
      </Card>
    </PageWrapper>
    <Footer />
  </Layout>
);

export const NoticesPage = ({ notices }: { notices: any[] }) => (
  <Layout title="赛事公告">
    <Nav current="/notices" title="赛事公告" />
    <PageWrapper>
      {notices.length > 0 ? (
        <div class="space-y-4">
          {notices.map((n: any) => (
            <Card hover={true}>
              <div class="flex items-start justify-between mb-3">
                <h3 class="font-medium text-slate-800">{n.title}</h3>
                <span class="text-xs text-slate-400 whitespace-nowrap ml-4">{n.created_at?.slice(0, 10)}</span>
              </div>
              <p class="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{n.content}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card hover={false}>
          <EmptyState icon="📢" title="暂无公告" description="敬请期待" />
        </Card>
      )}
    </PageWrapper>
    <Footer />
  </Layout>
);

export const ProgressPage = ({ events }: { events: any[] }) => (
  <Layout title="赛事进度">
    <Nav current="/progress" title="赛事进度" />
    <PageWrapper>
      <Card hover={false}>
        {events.length > 0 ? (
          <div class="space-y-5">
            {events.map((e: any) => {
              const pct = e.total > 0 ? Math.round((e.finished / e.total) * 100) : 0;
              return (
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="font-medium text-slate-800 text-sm">{e.title}</span>
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-slate-500">
                        {e.finished} / {e.total} 场
                      </span>
                      <Badge color={pct === 100 ? 'green' : pct > 0 ? 'yellow' : 'gray'}>{pct}%</Badge>
                    </div>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      class={`h-2.5 rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                      style={`width:${pct}%`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="📊" title="暂无项目数据" />
        )}
      </Card>
    </PageWrapper>
    <Footer />
  </Layout>
);
