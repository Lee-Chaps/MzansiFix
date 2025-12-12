
export type PriorityHint = 'low' | 'medium' | 'high';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  region?: string;
  avatar?: string; // emoji or base64
  linkedAccounts?: {
    google?: boolean;
    apple?: boolean;
  };
}

export interface UserSettings {
  language: string;
  defaultAnonymous: boolean;
  dataSaver: boolean;
  notifications: {
    email: boolean;
    sms: boolean;
  };
}

export interface ContactDetails {
  saps_station: string | null;
  saps_emergency: string | null;
  saps_station_line: string | null;
  jmpd_region: string | null;
  jmpd_contact_centre: string | null;
  municipal_department_contact: string | null;
}

// Matches the MnaZiFix Output Schema
export interface IssueReport {
  report_id: string;
  primary_category: string;
  secondary_category: string | null;
  detected_objects: string[];
  severity_score: number;
  priority: 'Low' | 'Medium' | 'High' | 'Immediate';
  confidence: number;
  suggested_department: string[];
  contact_details?: ContactDetails; // New field for SAPS/JMPD routing
  dispatch_recommendation: string | null;
  estimated_time_to_fix: string | null;
  sla_tier: string | null;
  human_summary: string | null;
  clarifying_questions: string[];
  emergency: boolean;
  metadata: {
     language_detected: string;
     image_evidence: any[];
     rules_triggered: string[];
  };
  
  // App-specific fields injected after AI analysis
  coords?: LocationData;
  image?: string; // base64
  createdAt?: number; // timestamp
  status?: 'submitted' | 'in_progress' | 'resolved';
  isAnonymous?: boolean;
}

export interface PendingReport {
  id: string;
  timestamp: number;
  image: string; // base64
  description: string;
  location: LocationData | null;
  priorityHint: PriorityHint;
  isAnonymous?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

// New Type for managing view state cleanly
export type AppView = 'dashboard' | 'create' | 'view_report' | 'queue' | 'profile' | 'directory' | 'settings';
