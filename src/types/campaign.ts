export interface Contact {
  name: string;
  email: string;
  instagramurl: string;
  currenttask: number;
  starteddate: number;
  instastartingmessage: string;
  emailstartingmessage: string;
  instasecondmessage: string;
  emailsecondmessage: string;
  ai?: boolean;
  lastUpdated?: number;
  dataSource?: 'scraped' | 'fallback';
  processingError?: string;
}

export interface Campaign {
  id: string;
  name: string;
  csvdata: Contact[];
  createdAt: number;
  status?: 'idle' | 'processing' | 'completed' | 'completed_with_errors' | 'failed';
  processedCount?: number;
  failedCount?: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}