import Dexie, { type Table } from "dexie";

export interface LocalArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface LocalAlert {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  area: string;
  source: string;
  // Ang admin form ay nagsu-store ng `date`; ang DB ay maaaring may `created_at` din.
  // Optional pareho para tumugma sa totoong shape ng data mula Supabase.
  date?: string;
  created_at?: string;
}

export interface LocalContact {
  id: string;
  name: string;
  role: string;
  facility: string;
  phone: string;
  location: string;
  status: string;
  type: string;
}

export interface LocalTriageConfig {
  id: string;
  data: object;
  updated_at: string;
}

// Nakapila na anonymous triage session na hindi pa naipapadala sa Supabase
// (hal. offline nang matapos ang triage). Ipapadala pagbalik ng internet.
// Walang PII — pareho ng shape ng `triage_sessions` insert.
export interface PendingTriageSession {
  id?: number; // auto-increment local key (Dexie ang bahala)
  urgency_result: string | null;
  age_group: string | null;
  user_type: string | null;
  red_flag_count: number;
  flagged_clusters: string[];
  completed: boolean;
  is_offline: boolean;
  created_at: string; // ISO — kung KAILAN talaga naganap ang session (hindi flush time)
}

class TALADatabase extends Dexie {
  articles!: Table<LocalArticle>;
  alerts!: Table<LocalAlert>;
  contacts!: Table<LocalContact>;
  triageConfig!: Table<LocalTriageConfig>;
  pendingSessions!: Table<PendingTriageSession>;

  constructor() {
    super("tala_db");
    this.version(1).stores({
      articles:    "id, status, category",
      alerts:      "id, status, priority",
      contacts:    "id, status, type",
      triageConfig: "id",
    });
    // v2: idinagdag ang outbox para sa offline triage sessions.
    this.version(2).stores({
      articles:    "id, status, category",
      alerts:      "id, status, priority",
      contacts:    "id, status, type",
      triageConfig: "id",
      pendingSessions: "++id, created_at",
    });
  }
}

export const db = new TALADatabase();