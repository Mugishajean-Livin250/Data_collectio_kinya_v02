// src/features/admin/adminAPI.ts
export interface AudioItem {
  id: number;
  topic: string;
  status: string;
  created_at: string;
  updated_at: string;
  download_url: string;
  filename: string;
  duration?: number | null;
  quality_issues?: string[] | null;
  ai_transcription?: string | null;
  ai_transcription_english?: string | null;
  human_transcription?: string | null;
  final_transcription?: string | null;
}

export async function apiFetch<T>(
  path: string,
  token: string | null,
  opts: RequestInit = {}
): Promise<T> {
  if (!token) throw new Error("No auth token");
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...((opts && (opts.headers as Record<string,string>)) || {}),
  };

  const res = await fetch(`http://localhost:8000${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const json = JSON.parse(text);
      msg = json.detail || json.msg || JSON.stringify(json) || msg;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg);
  }

  // some endpoints return plain text (like force-transcription returns json)
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }
  // fallback to text
  return (await res.text()) as unknown as T;
}

// Admin-specific API helpers
export const getAllAssignedAudios = async (token: string | null): Promise<AudioItem[]> =>
  apiFetch<AudioItem[]>("/assigned-audios", token, { method: "GET" });

export const downloadAudioUrl = (audioId: number) =>
  `http://localhost:8000/download-audio/${audioId}`;

export const forceTranscription = async (audioId: number, token: string | null) =>
  apiFetch<{ msg: string; transcription?: string }>(`/force-transcription/${audioId}`, token, { method: "POST" });

export const reviewTranscription = async (audioId: number, approve: boolean, token: string | null) =>
  apiFetch<{ msg: string }>(`/review-transcription/${audioId}`, token, {
    method: "POST",
    body: JSON.stringify({ approve }),
  });

export const getAudioQualityReport = async (audioId: number, token: string | null) =>
  apiFetch<any>(`/audio-quality-report/${audioId}`, token, { method: "GET" });

export const createUser = async (username: string, password: string, role: string, token: string | null) =>
  apiFetch<{ msg: string }>(`/create-user`, token, {
    method: "POST",
    body: JSON.stringify({ username, password, role }),
  });

export const assignAudio = async (topic: string, collector_id: number, transcriber_id: number, validator_id: number | null, token: string | null) =>
  apiFetch<{ msg: string; audio_id?: number }>(`/assign-audio`, token, {
    method: "POST",
    body: JSON.stringify({ topic, collector_id, transcriber_id, validator_id }),
  });
