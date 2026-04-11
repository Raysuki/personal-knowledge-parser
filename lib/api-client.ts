import { getApiBaseUrl, isDesktopRuntime } from "@/lib/desktop-config";

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const baseUrl = await getApiBaseUrl();
  return `${baseUrl}${normalizePath(path)}`;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const url = await buildApiUrl(path);
  return fetch(url, init);
}

export function getBackendConnectionErrorMessage() {
  return isDesktopRuntime()
    ? "无法连接到本地解析服务，请重启应用或检查桌面配置。"
    : "无法连接到后端服务，请确认 http://localhost:8000 正在运行。";
}
