import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';

export const LoginPage: FC<{ error?: string }> = ({ error }) => (
  <Layout title="登录">
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-800">🏓 PaddlePal</h1>
          <p class="text-gray-500 text-sm mt-1">裁判管理系统</p>
        </div>
        <form method="post" action="/login" class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && <div class="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
          <div class="mb-4">
            <label class="block text-sm text-gray-600 mb-1">用户名</label>
            <input type="text" name="username" required autofocus
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pp-500 focus:border-pp-500" />
          </div>
          <div class="mb-6">
            <label class="block text-sm text-gray-600 mb-1">密码</label>
            <input type="password" name="password" required
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pp-500 focus:border-pp-500" />
          </div>
          <button type="submit" class="w-full py-2.5 bg-pp-600 text-white rounded-lg font-medium hover:bg-pp-700 transition">
            登录
          </button>
        </form>
        <p class="text-center text-gray-400 text-xs mt-4">
          <a href="/" class="hover:text-gray-600">← 返回首页</a>
        </p>
      </div>
    </div>
  </Layout>
);
