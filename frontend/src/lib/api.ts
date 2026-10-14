import { ChatMessage, NotificationItem, UserProgress } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchRoadmap() {
  const res = await fetch(`${API_BASE}/api/roadmap`);
  if (!res.ok) {
    throw new Error(`Failed to load roadmap: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchUserProgress(idToken: string): Promise<UserProgress> {
  const res = await fetch(`${API_BASE}/api/roadmap/progress`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch progress: ${res.statusText}`);
  }
  return res.json();
}

export async function saveUserProgress(
  idToken: string,
  progress: { completed_topics: string[]; github_urls: Record<string, string>; notes?: Record<string, string> }
) {
  const res = await fetch(`${API_BASE}/api/roadmap/progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(progress),
  });
  if (!res.ok) {
    throw new Error(`Failed to save progress: ${res.statusText}`);
  }
  return res.json();
}

export async function sendChatMessage(
  idToken: string,
  messages: ChatMessage[],
  phaseContext?: string
): Promise<{ response: string; phase_context?: string }> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      messages,
      phase_context: phaseContext,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Chat request failed: ${res.statusText}`);
  }
  return res.json();
}

export async function triggerCertWatchdog(idToken: string) {
  const res = await fetch(`${API_BASE}/api/certifications/verify`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Watchdog failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/api/certifications/notifications`);
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export async function markNotificationAsRead(idToken: string, notificationId: string) {
  const res = await fetch(`${API_BASE}/api/certifications/notifications/${notificationId}/read`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  return res.ok;
}
