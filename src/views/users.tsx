import type { FC } from 'hono/jsx';
import { Layout, Nav, Card } from '../components/layout';

type User = { id: number; username: string; role: string; name: string; created_at: string };

const ROLES = [
  { value: 'referee', label: '裁判长' },
  { value: 'deputy_referee', label: '副裁判长' },
  { value: 'scheduler', label: '编排长' },
  { value: 'recorder', label: '记录员' },
  { value: 'umpire', label: '裁判员' },
];

const roleLabel = (role: string) => ROLES.find(r => r.value === role)?.label || role;

export const UsersPage: FC<{ users: User[]; canManage: boolean }> = ({ users, canManage }) => (
  <Layout title="用户管理">
    <Nav current="/admin" />
    <div class="max-w-4xl mx-auto px-4 py-6 fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-800">👥 用户管理</h2>
        <a href="/admin" class="text-sm text-gray-500 hover:text-pp-600">← 返回</a>
      </div>

      {!canManage ? (
        <Card>
          <div class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-2">🔒</div>
            <div>仅裁判长可管理用户</div>
          </div>
        </Card>
      ) : (
        <>
          <Card title="添加用户" class="mb-4">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              <input type="text" id="newUsername" placeholder="用户名" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="password" id="newPassword" placeholder="密码" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input type="text" id="newName" placeholder="姓名" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <select id="newRole" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {ROLES.map(r => <option value={r.value}>{r.label}</option>)}
              </select>
              <button onclick="addUser()" class="bg-pp-600 text-white rounded-lg hover:bg-pp-700 text-sm">添加</button>
            </div>
          </Card>

          <Card title={`用户列表 (${users.length})`}>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-200 text-left text-gray-500">
                  <th class="py-2">用户名</th>
                  <th class="py-2">姓名</th>
                  <th class="py-2">角色</th>
                  <th class="py-2">创建时间</th>
                  <th class="py-2 text-right">操作</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                {users.map(u => (
                  <tr class="hover:bg-gray-50" data-id={u.id}>
                    <td class="py-2 font-medium">{u.username}</td>
                    <td class="py-2 text-gray-600">{u.name}</td>
                    <td class="py-2">
                      <span class={`px-2 py-0.5 rounded text-xs ${u.role === 'referee' ? 'bg-red-100 text-red-700' : u.role === 'scheduler' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td class="py-2 text-gray-400 text-xs">{u.created_at?.slice(0, 10)}</td>
                    <td class="py-2 text-right">
                      <button onclick={`resetPassword(${u.id})`} class="text-blue-600 hover:underline text-xs mr-2">重置密码</button>
                      <button onclick={`deleteUser(${u.id})`} class="text-red-600 hover:underline text-xs">删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>

    <script dangerouslySetInnerHTML={{ __html: `
function addUser() {
  var username = document.getElementById('newUsername').value;
  var password = document.getElementById('newPassword').value;
  var name = document.getElementById('newName').value;
  var role = document.getElementById('newRole').value;

  if (!username || !password) { alert('用户名和密码必填'); return; }

  fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: username, password: password, name: name, role: role })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) location.reload();
    else alert('错误: ' + res.error);
  });
}

function resetPassword(id) {
  var newPass = prompt('输入新密码:');
  if (!newPass) return;

  fetch('/api/users/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: newPass })
  }).then(function(r) { return r.json(); }).then(function(res) {
    if (res.success) alert('密码已重置');
    else alert('错误: ' + res.error);
  });
}

function deleteUser(id) {
  if (!confirm('确定删除此用户？')) return;

  fetch('/api/users/' + id, { method: 'DELETE' })
    .then(function(r) { return r.json(); })
    .then(function(res) {
      if (res.success) location.reload();
      else alert('错误: ' + res.error);
    });
}
`}} />
  </Layout>
);
