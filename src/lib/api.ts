const DEFAULT_BASE = "http://localhost:8000";

export function getApiBaseUrl(): string {
  const fromEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  return (fromEnv && fromEnv.replace(/\/$/, "")) || DEFAULT_BASE;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` – ${text}` : ""}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return (await res.json()) as T;
  return (await res.text()) as unknown as T;
}

export interface TaskResponse {
  task_id: string;
}

export interface TaskStatus {
  task_id: string;
  status: "pending" | "processing" | "completed" | "failed" | string;
  step?: string;
  progress?: number;
  result?: {
    image_base64?: string;
    caption?: string;
    [k: string]: unknown;
  };
  error?: string;
  message?: string;
}

export interface SavedPost {
  id: string;
  label: string;
  image_base64: string;
  caption: string;
  prompt?: string;
  created_at?: string;
}

export const api = {
  generate: (body: {
    prompt: string;
    reference_images?: string[];
    custom_caption_prompt?: string;
  }) =>
    request<TaskResponse>("/api/generate", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  task: (taskId: string) => request<TaskStatus>(`/api/task/${taskId}`),

  editImage: (body: { image_base64: string; prompt: string }) =>
    request<TaskResponse>("/api/edit/image", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  editText: (body: { caption: string; instructions: string }) =>
    request<{ caption: string }>("/api/edit/text", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listPosts: () => request<SavedPost[]>("/api/posts"),

  savePost: (body: {
    label: string;
    image_base64: string;
    caption: string;
    prompt?: string;
  }) =>
    request<SavedPost>("/api/posts/save", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  downloadUrl: (postId: string) => `${getApiBaseUrl()}/api/posts/${postId}/download`,
};

function isRetryablePollError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network error") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504")
  );
}

export async function pollTask(
  taskId: string,
  onProgress?: (s: TaskStatus) => void,
  intervalMs = 1000,
  // 0 or negative disables the timeout entirely
  timeoutMs = 0,
  // Optional: bail out if no progress/step change is observed for this long
  stallTimeoutMs = 0,
): Promise<TaskStatus> {
  const started = Date.now();
  let lastChange = Date.now();
  let lastSig = "";
  let lastStatus: TaskStatus | null = null;
  let consecutivePollErrors = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const status = await api.task(taskId);
      consecutivePollErrors = 0;
      lastStatus = status;
      onProgress?.(status);
      const sig = `${status.status}|${status.step ?? ""}|${status.progress ?? ""}`;
      if (sig !== lastSig) {
        lastSig = sig;
        lastChange = Date.now();
      }
      if (status.status === "completed") return status;
      if (status.status === "failed") throw new Error(status.error || status.message || "Task failed");
    } catch (error) {
      consecutivePollErrors += 1;
      if (timeoutMs > 0 && Date.now() - started > timeoutMs) throw new Error("Task timed out");
      if (stallTimeoutMs > 0 && Date.now() - lastChange > stallTimeoutMs)
        throw new Error("Task stalled (no progress updates)");
      if (!isRetryablePollError(error) || consecutivePollErrors >= 30) throw error;

      onProgress?.({
        task_id: taskId,
        status: lastStatus?.status || "processing",
        step: lastStatus?.step || "Still working… reconnecting to status updates",
        progress: lastStatus?.progress,
        result: lastStatus?.result,
        message: error instanceof Error ? error.message : "Polling failed",
      });
    }
    if (timeoutMs > 0 && Date.now() - started > timeoutMs) throw new Error("Task timed out");
    if (stallTimeoutMs > 0 && Date.now() - lastChange > stallTimeoutMs)
      throw new Error("Task stalled (no progress updates)");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const idx = result.indexOf(",");
      resolve(idx >= 0 ? result.slice(idx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToDataUrl(b64: string, mime = "image/png") {
  if (b64.startsWith("data:")) return b64;
  return `data:${mime};base64,${b64}`;
}
