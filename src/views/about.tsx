import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

export const AboutPage: FC<{ tournament: { title: string; venue: string; dates: string; organizer: string; contact: string } }> = ({ tournament }) => (
  <Layout title="关于赛事">
    <Nav current="/about" title="关于赛事" />
    <PageWrapper>
      <div class="max-w-2xl mx-auto">
        {/* Hero */}
        <div class="text-center mb-10">
          <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <span class="text-white text-4xl">🏓</span>
          </div>
          <h1 class="text-3xl font-bold text-slate-800">{tournament.title}</h1>
        </div>

        {/* Info */}
        <Card class="mb-6">
          <div class="space-y-5">
            {[
              { icon: '📍', label: '比赛场馆', value: tournament.venue },
              { icon: '📅', label: '比赛日期', value: tournament.dates },
              { icon: '🏢', label: '主办单位', value: tournament.organizer },
              { icon: '📞', label: '联系方式', value: tournament.contact },
            ].map(item => (
              <div class="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <span class="text-2xl">{item.icon}</span>
                <div>
                  <div class="text-sm text-slate-500">{item.label}</div>
                  <div class="font-semibold text-slate-800">{item.value || '待定'}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Tech */}
        <Card title="技术支持">
          <div class="text-center py-4">
            <div class="flex items-center justify-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span class="text-white text-xl">🏓</span>
              </div>
              <div class="text-left">
                <div class="text-xl font-bold text-emerald-600">PaddlePal 拍档</div>
                <div class="text-sm text-slate-500">现代化乒乓球赛事管理系统</div>
              </div>
            </div>
            <div class="text-sm text-slate-400">v1.0.0 · Powered by Cloudflare Workers</div>
          </div>
        </Card>

        {/* QR */}
        <div class="mt-8 text-center">
          <a href="/qr" class="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 shadow-lg shadow-emerald-500/25 transition-all">
            📱 扫码访问
          </a>
        </div>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
