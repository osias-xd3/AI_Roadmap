export interface Resource {
  name: string;
  url: string;
  note?: string;
}

export interface Phase {
  id: string;
  phase_number: number;
  title: string;
  duration: string;
  parallel_with?: string | null;
  topics: string[];
  core_resources: Resource[];
  reference_resources: Resource[];
  from_scratch_exercise: string;
  projects: string[];
  done_when: string;
}

export interface Certification {
  id: string;
  name: string;
  provider: string;
  url: string;
  status: "ACTIVE_FREE" | "TRAINING_FREE_EXAM_PAID" | "FINANCIAL_AID_REQUIRED" | "NO_FREE_CERT" | string;
  cost_model: string;
  notes: string;
  last_checked: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  status_type: "NEW_CERT" | "DISBANDED" | "VERIFIED";
  read: boolean;
  created_at: string;
}

export interface UserProgress {
  uid: string;
  completed_topics: string[];
  github_urls: Record<string, string>;
  notes?: Record<string, string>;
}

export interface ChatMessage {
  role: "user" | "assistant" | "model";
  content: string;
}
