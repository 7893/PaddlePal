// Database models
export interface Tournament {
  id: number;
  name: string;
  info: string;
  addr: string;
  date: string;
  tables: number;
  days: number;
  created_at: string;
}

export interface Event {
  id: number;
  tournament_id: number;
  key: string;
  title: string;
  type: 'singles' | 'doubles' | 'team';
  format: 'knockout' | 'roundrobin' | 'group_knockout';
  scoring: string;
  beg_time: string;
  end_time: string;
}

export interface Team {
  id: number;
  tournament_id: number;
  name: string;
  short_name: string;
  flag: string | null;
}

export interface Player {
  id: number;
  tournament_id: number;
  team_id: number | null;
  name: string;
  gender: 'M' | 'F';
  rating: number;
  phone: string | null;
}

export interface Match {
  id: number;
  event_id: number;
  round: number;
  match_no: number;
  table_no: number | null;
  player1_id: number | null;
  player2_id: number | null;
  team1_id: number | null;
  team2_id: number | null;
  result: string | null;
  winner_id: number | null;
  status: 'pending' | 'checkin' | 'playing' | 'finished';
  scheduled_time: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface Notice {
  id: number;
  tournament_id: number;
  title: string;
  content: string;
  created_at: string;
}

export interface RatingHistory {
  id: number;
  player_id: number;
  match_id: number;
  old_rating: number;
  new_rating: number;
  created_at: string;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Cloudflare bindings
export interface Env {
  DB: D1Database;
  FILES: R2Bucket;
}
