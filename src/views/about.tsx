import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

export const AboutPage: FC<{ tournament: { title: string; venue: string; dates: string; organizer: string; contact: string } }> = ({ tournament }) => (
  <Layout title="关于赛事">
    <Nav current="/" />
    <div class="max-w-2xl mx-auto px-4 py-6 fade-in">
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">🏓</div>
        <h1 class="text-2xl font-bold text-gray-800">{tournament.title}</h1>
      </div>

      <Card class="mb-4">
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📍</span>
            <div>
              <div class="text-sm text-gray-500">比赛场馆</div>
              <div class="font-medium">{tournament.venue || '待定'}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">📅</span>
            <div>
              <div class="text-sm text-gray-500">比赛日期</div>
              <div class="font-medium">{tournament.dates || '待定'}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">🏢</span>
            <div>
              <div class="text-sm text-gray-500">主办单位</div>
              <div class="font-medium">{tournament.organizer || '待定'}</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-2xl">📞</span>
            <div>
              <div class="text-sm text-gray-500">联系方式</div>
              <div class="font-medium">{tournament.contact || '待定'}</div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="技术支持">
        <div class="text-center text-gray-600">
          <div class="text-lg font-bold text-pp-600 mb-2">PaddlePal 拍档</div>
          <div class="text-sm">现代化乒乓球赛事管理系统</div>
          <div class="text-xs text-gray-400 mt-2">v1.0.0 · Powered by Cloudflare Workers</div>
        </div>
      </Card>

      <div class="mt-6 text-center">
        <a href="/qr" class="inline-block px-6 py-3 bg-pp-600 text-white rounded-xl hover:bg-pp-700">
          📱 扫码访问
        </a>
      </div>
    </div>
  </Layout>
);
