import type { FC } from 'hono/jsx';
import { Layout, Nav, Card, PageWrapper, Footer } from '../components/layout';

export const FlagUploadPage: FC<{ teams: { id: number; name: string; flag?: string }[] }> = ({ teams }) => (
  <Layout title="队旗管理">
    <Nav current="/admin/flags" title="队旗管理" />
    <PageWrapper>
      <div class="max-w-4xl mx-auto">
        <Card class="mb-6">
          <div class="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div class="text-2xl">📋</div>
            <div class="text-sm">
              <h4 class="font-semibold text-amber-800 mb-2">上传要求</h4>
              <ul class="text-amber-700 space-y-1">
                <li>• 格式：PNG 或 JPG</li>
                <li>• 尺寸：建议 200×120 像素（宽高比 5:3）</li>
                <li>• 大小：不超过 500KB</li>
                <li>• 背景：建议使用透明背景 PNG</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card title="队伍列表">
          {teams.length > 0 ? (
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-500">
                    <th class="py-3 text-left font-semibold w-24">队旗</th>
                    <th class="py-3 text-left font-semibold">队伍名称</th>
                    <th class="py-3 text-left font-semibold w-56">操作</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  {teams.map((t) => (
                    <tr class="hover:bg-slate-50 transition-colors">
                      <td class="py-3">
                        {t.flag ? (
                          <img src={t.flag} alt="" class="w-16 h-10 object-contain rounded-lg bg-slate-100" />
                        ) : (
                          <div class="w-16 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                            无
                          </div>
                        )}
                      </td>
                      <td class="py-3 font-semibold text-slate-800">{t.name}</td>
                      <td class="py-3">
                        <form class="upload-form flex items-center gap-2" data-team-id={t.id}>
                          <input
                            type="file"
                            name="flag"
                            accept="image/png,image/jpeg"
                            class="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 file:cursor-pointer file:transition-colors"
                          />
                          <button
                            type="submit"
                            class="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors"
                          >
                            上传
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div class="text-center py-12">
              <div class="text-5xl mb-4 opacity-50">🚩</div>
              <p class="text-slate-400">暂无队伍</p>
            </div>
          )}
        </Card>
      </div>
    </PageWrapper>
    <Footer />

    <script
      dangerouslySetInnerHTML={{
        __html: `
      document.querySelectorAll('.upload-form').forEach(form => {
        form.onsubmit = async (e) => {
          e.preventDefault();
          const teamId = form.dataset.teamId;
          const file = form.querySelector('input[type="file"]').files[0];
          if (!file) { alert('请选择文件'); return; }
          if (file.size > 500 * 1024) { alert('文件大小不能超过500KB'); return; }
          const res = await fetch('/api/flag/' + teamId, { method: 'POST', body: file, headers: { 'Content-Type': file.type } });
          if (res.ok) { alert('上传成功'); location.reload(); } else { alert('上传失败'); }
        };
      });
    `,
      }}
    />
  </Layout>
);

export const BigScreenFlags: FC = () => <div>Flags</div>;
