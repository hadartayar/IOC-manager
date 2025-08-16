import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'ioc.db');
sqlite3.verbose();
export const db = new sqlite3.Database(dbPath);
export function initDb() {
  db.serialize(() => {
    db.run(`PRAGMA foreign_keys = ON;`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin','analyst','viewer')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      reliability INTEGER NOT NULL CHECK (reliability BETWEEN 0 AND 100),
      url TEXT,
      description TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value TEXT NOT NULL,
      normalized_value TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('ip','domain','md5','sha1','sha256')),
      verdict TEXT NOT NULL CHECK (verdict IN ('malicious','suspicious','benign')),
      source_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
    )`);
    db.run(`CREATE TRIGGER IF NOT EXISTS trg_indicators_updated_at
      AFTER UPDATE ON indicators FOR EACH ROW
      BEGIN
        UPDATE indicators SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id;
      END;`);
    db.run(`CREATE TABLE IF NOT EXISTS indicator_tags (
      indicator_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (indicator_id, tag_id),
      FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )`);
  });
}
export function seedDb() {
  const users = [
    { username: 'admin@local', role: 'admin', password: 'S3cureAdmin!' },
    { username: 'analyst@local', role: 'analyst', password: 'Analyst123!' },
    { username: 'viewer@local', role: 'viewer', password: 'Viewer123!' }
  ];
  db.serialize(() => {
    users.forEach(u => {
      const hash = bcrypt.hashSync(u.password, 10);
      db.run(`INSERT OR IGNORE INTO users(username, password_hash, role) VALUES (?,?,?)`,
        [u.username, hash, u.role]);
    });
    db.run(`INSERT OR IGNORE INTO sources(id, name, reliability, url, description)
      VALUES
      (1, 'AbuseIPDB', 85, 'https://abuseipdb.com', 'Community IP abuse reports'),
      (2, 'VirusTotal', 90, 'https://virustotal.com', 'Multi-engine scans'),
      (3, 'Manual Entry', 60, NULL, 'Analyst provided')`);
    db.run(`INSERT OR IGNORE INTO tags(id, name) VALUES
      (1,'phishing'),(2,'c2'),(3,'ransomware'),(4,'test')`);
    db.run(`INSERT OR IGNORE INTO indicators(id,value,normalized_value,type,verdict,source_id) VALUES
      (1,'8.8.8.8','8.8.8.8','ip','benign',1),
      (2,'evil.example.com','evil.example.com','domain','malicious',2),
      (3,'44D88612FEA8A8F36DE82E1278ABB02F','44d88612fea8a8f36de82e1278abb02f','md5','malicious',2)`);
    db.run(`INSERT OR IGNORE INTO indicator_tags(indicator_id, tag_id) VALUES (2,1),(2,2),(3,3)`);
  });
}
initDb();
