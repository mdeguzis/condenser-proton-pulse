// Network actions. The Steam CEF frontend blocks cross-origin fetch, so the
// frontend's platform.fetchNoCors routes here. Node has no CORS limit, so this is
// a direct replacement for what the Python backend's no-CORS fetch did.

export async function fetchProxy(data: { url: string; method?: string; headers?: Record<string, string>; body?: string | null }) {
  const { url, method = 'GET', headers = {}, body = null } = data;
  if (!url) return { status: 0, body: '' };
  try {
    const res = await fetch(url, { method, headers, body: body ?? undefined });
    return { status: res.status, body: await res.text() };
  } catch (err) {
    return { status: 0, body: err instanceof Error ? err.message : String(err) };
  }
}

export async function getProtonDbSummary(data: { appId: string }) {
  const { appId } = data;
  if (!appId) return { ok: false, error: 'missing appId' };
  try {
    const res = await fetch(`https://www.protondb.com/api/v1/reports/summaries/${appId}.json`);
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, summary: await res.json() };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
