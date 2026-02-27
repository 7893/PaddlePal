import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

export const HelpPage: FC = () => (
  <Layout title="使用帮助">
    <Nav current="/help" title="使用帮助" />
    <PageWrapper>
      <div class="max-w-3xl mx-auto">
        <div class="grid gap-6">
          <Card title="🏓 选手功能">
            <div class="space-y-4">
              {[
                { title: '我的比赛', desc: '访问 /my 选择您的姓名，查看个人赛程和比赛提醒' },
                { title: '实时比分', desc: '访问 /live 查看正在进行的比赛实时比分' },
                { title: '赛程安排', desc: '访问 /schedule 查看完整赛程表' },
                { title: '比赛成绩', desc: '访问 /results 查看已完成比赛的成绩和排名' },
              ].map(item => (
                <div class="flex gap-4 p-4 bg-slate-50 rounded-xl">
                  <div class="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
                  <div>
                    <div class="font-semibold text-slate-800">{item.title}</div>
                    <div class="text-sm text-slate-500 mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="📝 裁判员功能">
            <div class="space-y-4">
              {[
                { title: '比分录入', desc: '访问 /score/:场次号 录入比赛比分，支持点击快速记分' },
                { title: '快捷输入', desc: '支持连续数字格式如 1109110811091103（表示11:9, 11:8, 11:9, 11:3）' },
                { title: '弃权处理', desc: '点击弃权按钮处理选手弃权情况' },
              ].map(item => (
                <div class="flex gap-4 p-4 bg-slate-50 rounded-xl">
                  <div class="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <div>
                    <div class="font-semibold text-slate-800">{item.title}</div>
                    <div class="text-sm text-slate-500 mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="📋 编排长功能">
            <div class="space-y-4">
              {[
                { title: '抽签管理', desc: '访问 /admin/draw 进行分组抽签，支持种子设置和同队分离' },
                { title: '赛程编排', desc: '使用 Berger 算法自动生成循环赛/淘汰赛赛程' },
                { title: '球台分配', desc: '自动或手动分配比赛球台，优化场地利用' },
              ].map(item => (
                <div class="flex gap-4 p-4 bg-slate-50 rounded-xl">
                  <div class="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                  <div>
                    <div class="font-semibold text-slate-800">{item.title}</div>
                    <div class="text-sm text-slate-500 mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="👑 裁判长功能">
            <div class="space-y-4">
              {[
                { title: '成绩确认', desc: '访问 /admin/confirm 确认比赛成绩，锁定最终结果' },
                { title: '申诉处理', desc: '访问 /admin/appeals 处理选手申诉' },
                { title: '用户管理', desc: '访问 /admin/users 管理系统用户和权限' },
                { title: '系统设置', desc: '访问 /admin/settings 配置球台数量、比赛时长等参数' },
              ].map(item => (
                <div class="flex gap-4 p-4 bg-slate-50 rounded-xl">
                  <div class="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                  <div>
                    <div class="font-semibold text-slate-800">{item.title}</div>
                    <div class="text-sm text-slate-500 mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="⌨️ 快捷键">
            <div class="grid grid-cols-2 gap-4">
              {[
                { key: 'Enter', desc: '保存比分' },
                { key: 'Tab', desc: '下一局' },
                { key: 'Esc', desc: '取消操作' },
                { key: 'Ctrl+P', desc: '打印页面' },
              ].map(item => (
                <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <kbd class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-mono shadow-sm">{item.key}</kbd>
                  <span class="text-slate-600">{item.desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageWrapper>
    <Footer />
  </Layout>
);
