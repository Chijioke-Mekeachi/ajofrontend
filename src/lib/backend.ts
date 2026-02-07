import { supabase } from "@/integrations/supabase/client";

const DEFAULT_BACKEND_URL = "http://localhost:4000";
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;
const BACKEND_URL = RAW_BACKEND_URL.replace(/\/+$/, "");

type ApiOptions = {
  auth?: boolean;
};

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiPost<T>(path: string, body: unknown, options: ApiOptions = {}): Promise<T> {
  const { auth = true } = options;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = await getAccessToken();
    if (!token) {
      throw new Error("Not authenticated");
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${BACKEND_URL}${normalizedPath}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body ?? {}),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMessage = json?.error || json?.message || "Request failed";
    throw new Error(errorMessage);
  }

  return json as T;
}

export function getBackendUrl() {
  return BACKEND_URL;
}
