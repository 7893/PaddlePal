import type { FC } from 'hono/jsx';
import { Layout } from '../components/layout';

export const LoginPage: FC<{ error?: string }> = ({ error }) => (
  <Layout title="登录">
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0); background-size: 32px 32px;"></div>
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
      
      <div class="w-full max-w-sm relative z-10">
        <div class="text-center mb-8">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
            <span class="text-white text-2xl">🏓</span>
          </div>
          <h1 class="text-2xl font-bold text-white">拍档 PaddlePal</h1>
          <p class="text-emerald-300/70 text-sm mt-2">裁判管理系统</p>
        </div>
        <form method="post" action="/login" class="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8">
          {error && <div class="mb-4 p-3 bg-red-500/20 text-red-200 text-sm rounded-xl border border-red-500/30">{error}</div>}
          <div class="mb-5">
            <label class="block text-sm text-white/70 mb-2">用户名</label>
            <input type="text" name="username" required autofocus
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" placeholder="请输入用户名" />
          </div>
          <div class="mb-6">
            <label class="block text-sm text-white/70 mb-2">密码</label>
            <input type="password" name="password" required
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow" placeholder="请输入密码" />
          </div>
          <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/30">
            登录
          </button>
        </form>
        <p class="text-center text-white/40 text-sm mt-6">
          <a href="/" class="hover:text-white/70 transition-colors">← 返回首页</a>
        </p>
      </div>
    </div>
  </Layout>
);
