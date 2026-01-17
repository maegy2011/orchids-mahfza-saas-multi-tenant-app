import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as mainSchema from "./schema-main";
import * as tenantSchema from "./schema-tenant";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");
const MAIN_DB_PATH = path.join(DATA_DIR, "main.db");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Main Database Connection
const mainSqlite = new Database(MAIN_DB_PATH);
export const mainDb = drizzle(mainSqlite, { schema: mainSchema });

// Initialize Main DB tables if they don't exist
const initMainDb = () => {
  mainSqlite.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      db_path TEXT NOT NULL,
      manager_email TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      telegram_chat_id TEXT NOT NULL,
      telegram_username TEXT,
      subject TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS ticket_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      sender_type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
  `);
  
  // Migration: add is_active column if it doesn't exist
  try {
    mainSqlite.exec(`ALTER TABLE companies ADD COLUMN is_active INTEGER NOT NULL DEFAULT 0`);
  } catch {
    // Column already exists
  }
};

initMainDb();

// Tenant Database Connection Factory
export const getTenantDb = (companyId: string) => {
  const dbPath = path.join(DATA_DIR, `tenant_${companyId}.db`);
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema: tenantSchema });

  // Initialize Tenant DB tables if they don't exist (Better-Auth + Business)
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER NOT NULL,
        image TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        role TEXT DEFAULT 'employee'
      );
      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        expires_at INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
        ip_address TEXT,
        user_agent TEXT,
        user_id TEXT NOT NULL REFERENCES user(id)
      );
      CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES user(id),
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        access_token_expires_at INTEGER,
        refresh_token_expires_at INTEGER,
        scope TEXT,
        password TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
      );
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        created_at INTEGER,
        updated_at INTEGER
      );

    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      manager_id TEXT REFERENCES user(id),
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES user(id),
      branch_id TEXT REFERENCES branches(id),
      balance REAL NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      wallet_id TEXT NOT NULL REFERENCES wallets(id),
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL
    );
  `);

  return db;
};
