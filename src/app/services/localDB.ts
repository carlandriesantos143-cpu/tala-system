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

class TALADatabase extends Dexie {
  articles!: Table<LocalArticle>;
  alerts!: Table<LocalAlert>;
  contacts!: Table<LocalContact>;
  triageConfig!: Table<LocalTriageConfig>;

  constructor() {
    super("tala_db");
    this.version(1).stores({
      articles:    "id, status, category",
      alerts:      "id, status, priority",
      contacts:    "id, status, type",
      triageConfig: "id",
    });
  }
}

export const db = new TALADatabase();