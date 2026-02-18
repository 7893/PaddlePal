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

// View types for pages
export type HomeEvent = {
  key: string;
  event: string;
  title: string;
  plays: number;
  finish: number;
  progress: string;
  beg_time: string;
  end_time: string;
};

export type LiveMatch = {
  id: number;
  pid: number;
  tb: number;
  tm: string;
  gp: string;
  ev: string;
  nl: string;
  nr: string;
  tnl: string;
  tnr: string;
  result: string;
  score: { l: number; r: number }[];
};

export type UpcomingMatch = {
  id: number;
  pid: number;
  tb: number;
  tm: string;
  gp: string;
  nl: string;
  nr: string;
};

export type PlayerMember = {
  id: number;
  name: string;
  gender: string;
  team: string;
};

export type ScheduleMatch = {
  pid: number;
  time: string;
  table_no: number;
  date: string;
  status: string;
  result: string;
  player1: string;
  player2: string;
  event: string;
};

export type ResultEvent = {
  key: string;
  title: string;
  type: string;
  stage: string;
  plays: number;
  finish: number;
};

// Admin page types
export type AdminTeam = { id: number; name: string; short_name: string; count: number };
export type AdminPlayer = { id: number; name: string; gender: string; rating: number; team: string };
export type AdminEvent = { id: number; title: string; type: string; stage: string; groups: number; best_of: number };
export type AdminMatch = { pid: number; time: string; status: string; result: string; table: number; player1: string; player2: string; event: string };

// Score page types
export type ScoreInfo = {
  id: number; pid: number; table_no: number; time: string; status: string; result: string;
  seat1: number; seat2: number; p1: string; p2: string; t1: string; t2: string;
  title: string; best_of: number; scores: { l: number; r: number }[];
};

// Draw page types
export type DrawGroup = { id: number; name: string; players: { id: number; position: number; name: string }[] };
export type DrawPlayer = { id: number; name: string; team: string };
export type DrawEventInfo = { id: number; title: string; stage: string };

// Search result type
export type SearchMatch = { pid: number; time: string; table_no: number; status: string; result: string; player1: string; player2: string; event: string };

// Bracket types
export type BracketMatch = { id: number; round: number; position: number; status: string; result: string; winner: number; p1: string; p2: string; pid?: number };

// Team match types
export type TeamMatchInfo = {
  id: number; match_order: number; time: string; table_no: number; status: string; result: string;
  team1: string; team2: string; event: string;
  rubbers: { pid: number; p1: string; p2: string; result: string; status: string }[];
};

// Big screen types
export type ScreenMatch = { tb: number; gp: string; nl: string; nr: string; tnl: string; tnr: string; score?: string };
export type ScreenResult = { round: number; order: number; tb: number; result: string; winner: number; p1: string; p2: string };
export type ScreenSchedule = { time: string; tb: number; event: string; status: string; p1: string; p2: string };

// Ranking/Extra types
export type RankPlayer = { id: number; name: string; rating: number; team: string };
export type NoticeItem = { title: string; content: string; created_at: string };
export type ProgressEvent = { key: string; title: string; total: number; finished: number };

// Flags types
export type FlagMatch = { tb: number; event: string; score: string; p1: string; p2: string; flag1: string | null; flag2: string | null };
export type FlagTeam = { id: number; name: string; flag: string | null };
