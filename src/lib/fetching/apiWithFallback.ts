import axios, { AxiosRequestConfig } from "axios";

type GetOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
};

export async function getWithFallback<T>(
  apiPath: string,
  fallbackPublicJsonPath: string,
  options?: GetOptions
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  const timeout = options?.timeoutMs ?? 8000;

  const canCallApi = Boolean(baseUrl);

  if (canCallApi) {
    try {
      const url = `${baseUrl}${apiPath}`;
      const axiosConfig: AxiosRequestConfig = {
        headers: {
          "Content-Type": "application/json",
          ...(options?.headers ?? {}),
        },
        timeout,
        withCredentials: false,
      };
      const res = await axios.get(url, axiosConfig);
      if (res.status === 200) {
        return res.data as T;
      }
    } catch (_) {
      // fall through to JSON
    }
  }

  // Fallback to static JSON in public folder
  const jsonUrl = fallbackPublicJsonPath.startsWith("/")
    ? fallbackPublicJsonPath
    : `/${fallbackPublicJsonPath}`;

  const resp = await fetch(jsonUrl, { cache: "no-store" });
  if (!resp.ok) {
    throw new Error(`Fallback JSON fetch failed: ${jsonUrl}`);
  }
  return (await resp.json()) as T;
}


