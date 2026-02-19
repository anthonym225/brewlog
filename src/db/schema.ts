// T05: Database schema — CREATE TABLE statements for all 4 tables
// Matches DESIGN.md Section 4 exactly

export const CREATE_CAFES_TABLE = `
CREATE TABLE IF NOT EXISTS cafes (
  id TEXT PRIMARY KEY NOT NULL,
  google_place_id TEXT,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
`;

export const CREATE_VISITS_TABLE = `
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY NOT NULL,
  cafe_id TEXT NOT NULL,
  visited_at TEXT NOT NULL,
  notes TEXT,
  overall_rating REAL,
  coffee_quality REAL,
  interior_design INTEGER,
  vibe INTEGER,
  work_friendliness INTEGER,
  location_surroundings INTEGER,
  value INTEGER,
  wait_time INTEGER,
  food_pastries INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE
);
`;

export const CREATE_DRINKS_TABLE = `
CREATE TABLE IF NOT EXISTS drinks (
  id TEXT PRIMARY KEY NOT NULL,
  visit_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  rating INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);
`;

export const CREATE_PHOTOS_TABLE = `
CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY NOT NULL,
  visit_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE
);
`;

/**
 * All CREATE TABLE statements in dependency order.
 */
export const ALL_CREATE_STATEMENTS = [
  CREATE_CAFES_TABLE,
  CREATE_VISITS_TABLE,
  CREATE_DRINKS_TABLE,
  CREATE_PHOTOS_TABLE,
];
