const STORAGE_KEY = "afixz_query_submissions";

type SubmissionLog = { timestamps: number[] };

function getLog(): SubmissionLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timestamps: [] };
    return JSON.parse(raw) as SubmissionLog;
  } catch {
    return { timestamps: [] };
  }
}

function saveLog(log: SubmissionLog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

function pruneOld(timestamps: number[], windowMs: number): number[] {
  const cutoff = Date.now() - windowMs;
  return timestamps.filter((t) => t > cutoff);
}

export function checkRateLimit(maxPerWindow: number, windowMs: number): { allowed: boolean; retryAfterMs: number } {
  const log = getLog();
  const recent = pruneOld(log.timestamps, windowMs);

  if (recent.length >= maxPerWindow) {
    const oldest = recent[0];
    const retryAfterMs = oldest + windowMs - Date.now();
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 0) };
  }

  return { allowed: true, retryAfterMs: 0 };
}

export function recordSubmission() {
  const log = getLog();
  log.timestamps.push(Date.now());
  // keep only last 24h of timestamps
  log.timestamps = pruneOld(log.timestamps, 24 * 60 * 60 * 1000);
  saveLog(log);
}
