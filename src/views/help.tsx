import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

export const HelpPage: FC = () => (
  <Layout title="使用帮助">
    <Nav current="/" />
    <div class="max-w-3xl mx-auto px-4 py-6 fade-in">
      <h2 class="text-lg font-bold text-gray-800 mb-6">📖 使用帮助</h2>

      <Card title="选手功能" class="mb-4">
        <div class="space-y-3 text-sm text-gray-600">
          <div><strong>我的比赛</strong> - 访问 /my 选择您的姓名，查看个人赛程</div>
          <div><strong>实时比分</strong> - 访问 /live 查看正在进行的比赛</div>
          <div><strong>赛程安排</strong> - 访问 /schedule 查看完整赛程</div>
          <div><strong>比赛成绩</strong> - 访问 /results 查看已完成比赛</div>
        </div>
      </Card>

      <Card title="裁判员功能" class="mb-4">
        <div class="space-y-3 text-sm text-gray-600">
          <div><strong>比分录入</strong> - 访问 /score 录入比赛比分</div>
          <div><strong>快捷输入</strong> - 支持连续数字格式如 1109110811091103</div>
          <div><strong>弃权处理</strong> - 点击弃权按钮处理选手弃权</div>
        </div>
      </Card>

      <Card title="编排长功能" class="mb-4">
        <div class="space-y-3 text-sm text-gray-600">
          <div><strong>抽签管理</strong> - 访问 /admin/draw 进行分组抽签</div>
          <div><strong>赛程编排</strong> - 生成循环赛/淘汰赛赛程</div>
          <div><strong>球台分配</strong> - 自动或手动分配比赛球台</div>
        </div>
      </Card>

      <Card title="裁判长功能" class="mb-4">
        <div class="space-y-3 text-sm text-gray-600">
          <div><strong>成绩确认</strong> - 访问 /admin/confirm 确认比赛成绩</div>
          <div><strong>申诉处理</strong> - 访问 /admin/appeals 处理选手申诉</div>
          <div><strong>用户管理</strong> - 访问 /admin/users 管理系统用户</div>
          <div><strong>系统设置</strong> - 访问 /admin/settings 配置系统参数</div>
        </div>
      </Card>

      <Card title="快捷键">
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div><kbd class="px-2 py-1 bg-gray-100 rounded">Enter</kbd> 保存比分</div>
          <div><kbd class="px-2 py-1 bg-gray-100 rounded">Tab</kbd> 下一局</div>
          <div><kbd class="px-2 py-1 bg-gray-100 rounded">Esc</kbd> 取消</div>
          <div><kbd class="px-2 py-1 bg-gray-100 rounded">Ctrl+P</kbd> 打印</div>
        </div>
      </Card>
    </div>
  </Layout>
);
