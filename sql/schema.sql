-- PaddlePal D1 Schema

CREATE TABLE IF NOT EXISTS tournaments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, organizer TEXT, venue TEXT,
  start_date TEXT, end_date TEXT, info TEXT,
  tables_count INTEGER DEFAULT 0, days INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER, key TEXT, event_type TEXT,
  title TEXT, groups INTEGER, rounds INTEGER,
  best_of INTEGER, stage TEXT
);

CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER, name TEXT,
  short_name TEXT, flag TEXT
);

CREATE TABLE IF NOT EXISTS players (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER, team_id INTEGER,
  name TEXT, gender TEXT, seed INTEGER, rating INTEGER
);

CREATE TABLE IF NOT EXISTS group_tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER, group_name TEXT, group_index INTEGER
);

CREATE TABLE IF NOT EXISTS group_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER, player_id INTEGER, team_id INTEGER,
  position INTEGER, wins INTEGER, losses INTEGER,
  games_won INTEGER, games_lost INTEGER,
  points_won INTEGER, points_lost INTEGER, rank INTEGER
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER, group_id INTEGER, round INTEGER,
  match_order INTEGER, table_no INTEGER, date TEXT, time TEXT,
  player1_id INTEGER, player2_id INTEGER,
  player3_id INTEGER, player4_id INTEGER,
  team1_id INTEGER, team2_id INTEGER,
  team3_id INTEGER, team4_id INTEGER,
  result TEXT, status TEXT, winner_side INTEGER,
  seat1 INTEGER DEFAULT 0, seat2 INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER, game_no INTEGER,
  score_left INTEGER, score_right INTEGER
);

CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER, content TEXT,
  created_at TEXT, title TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER, filename TEXT,
  filepath TEXT, uploaded_at TEXT
);

CREATE TABLE IF NOT EXISTS brackets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER, round INTEGER, position INTEGER,
  player1_id INTEGER, player2_id INTEGER,
  team1_id INTEGER, team2_id INTEGER,
  winner_id INTEGER, match_id INTEGER,
  prev_match1_id INTEGER, prev_match2_id INTEGER
);

CREATE TABLE IF NOT EXISTS draws (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER, player_id INTEGER, team_id INTEGER,
  seed INTEGER, position INTEGER, draw_time TEXT
);

CREATE TABLE IF NOT EXISTS referees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER, name TEXT, gender TEXT DEFAULT 'M',
  level TEXT, title TEXT, phone TEXT
);

CREATE TABLE IF NOT EXISTS leaders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER, team_id INTEGER, name TEXT,
  gender TEXT DEFAULT 'M', title TEXT, phone TEXT
);

CREATE TABLE IF NOT EXISTS ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tournament_id INTEGER, player_id INTEGER,
  event_id INTEGER, match_id INTEGER,
  rating_before INTEGER DEFAULT 0, rating_after INTEGER DEFAULT 0,
  rating_change INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY, value TEXT
);
