import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer, Badge, EmptyState } from '../components/layout';

type User = { id: number; username: string; role: string; name: string; created_at: string };

const ROLES = [
  { value: 'referee', label: '裁判长', color: 'red' },
  { value: 'deputy_referee', label: '副裁判长', color: 'yellow' },
  { value: 'scheduler', label: '编排长', color: 'blue' },
  { value: 'recorder', label: '记录员', color: 'green' },
  { value: 'umpire', label: '裁判员', color: 'gray' },
];

const RoleBadge: FC<{ role: string }> = ({ role }) => {
  const r = ROLES.find((x) => x.value === role) || { label: role, color: 'gray' };
  return <Badge color={r.color}>{r.label}</Badge>;
};

export const UsersPage: FC<{ users: User[]; canManage: boolean }> = ({ users, canManage }) => (
  <Layout title="用户管理">
    <Nav current="/admin/users" title="用户管理" />
    <PageWrapper>
      {!canManage ? (
        <EmptyState icon="🔒" title="仅裁判长可管理用户" />
      ) : (
        <>
          <Card title="添加用户" class="mb-6">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              <input
                type="text"
                id="newUsername"
                placeholder="用户名"
                class="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="password"
                id="newPassword"
                placeholder="密码"
                class="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                id="newName"
                placeholder="姓名"
                class="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
              />
              <select
                id="newRole"
                class="border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500"
              >
                {ROLES.map((r) => (
                  <option value={r.value}>{r.label}</option>
                ))}
              </select>
              <button
                onclick="addUser()"
                class="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25"
              >
                添加
              </button>
            </div>
          </Card>

          <Card title={`用户列表 (${users.length})`}>
            {users.length > 0 ? (
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-left text-slate-500">
                    <th class="py-3 font-semibold">用户名</th>
                    <th class="py-3 font-semibold">姓名</th>
                    <th class="py-3 font-semibold">角色</th>
                    <th class="py-3 font-semibold">创建时间</th>
                    <th class="py-3 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr class="hover:bg-slate-50 transition-colors" data-id={u.id}>
                      <td class="py-3 font-semibold text-slate-800">{u.username}</td>
                      <td class="py-3 text-slate-600">{u.name}</td>
                      <td class="py-3">
                        <RoleBadge role={u.role} />
                      </td>
                      <td class="py-3 text-slate-400">{u.created_at?.slice(0, 10)}</td>
                      <td class="py-3 text-right space-x-2">
                        <button
                          onclick={`resetPassword(${u.id})`}
                          class="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-xs"
                        >
                          重置密码
                        </button>
                        <button
                          onclick={`deleteUser(${u.id})`}
                          class="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs"
                        >
                          删除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div class="text-center py-8 text-slate-400">暂无用户</div>
            )}
          </Card>
        </>
      )}
    </PageWrapper>
    <Footer />
    <script
      dangerouslySetInnerHTML={{
        __html: `function addUser(){var u=document.getElementById('newUsername').value,p=document.getElementById('newPassword').value,n=document.getElementById('newName').value,r=document.getElementById('newRole').value;if(!u||!p){alert('用户名和密码必填');return}fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p,name:n,role:r})}).then(r=>r.json()).then(res=>{if(res.success)location.reload();else alert('错误: '+res.error)})}function resetPassword(id){var p=prompt('输入新密码:');if(!p)return;fetch('/api/users/'+id,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:p})}).then(r=>r.json()).then(res=>{if(res.success)alert('密码已重置');else alert('错误: '+res.error)})}function deleteUser(id){if(!confirm('确定删除？'))return;fetch('/api/users/'+id,{method:'DELETE'}).then(r=>r.json()).then(res=>{if(res.success)location.reload();else alert('错误: '+res.error)})}`,
      }}
    />
  </Layout>
);
