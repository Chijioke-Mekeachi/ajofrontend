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

  let rawText = "";
  try {
    rawText = await response.text();
  } catch {
    rawText = "";
  }

  let json: any = {};
  if (rawText) {
    try {
      json = JSON.parse(rawText);
    } catch {
      json = {};
    }
  }

  if (!response.ok) {
    const errorMessage = json?.error || json?.message;
    const fallbackBody = rawText
      ? rawText.replace(/\s+/g, " ").trim().slice(0, 200)
      : null;
    const statusLabel = `${response.status}${response.statusText ? ` ${response.statusText}` : ""}`.trim();

    if (errorMessage) throw new Error(`${statusLabel}: ${errorMessage}`);
    if (fallbackBody) throw new Error(`${statusLabel}: ${fallbackBody}`);
    throw new Error(statusLabel || "Request failed");
  }

  if (!rawText) return {} as T;
  if (rawText && Object.keys(json).length === 0) {
    throw new Error("Invalid JSON response from backend");
  }

  return json as T;
}

export function getBackendUrl() {
  return BACKEND_URL;
}
