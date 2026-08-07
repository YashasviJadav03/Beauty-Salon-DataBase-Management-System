const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  const dbPath = path.join(__dirname, 'salon.db');
  const dbExists = fs.existsSync(dbPath);

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  await dbInstance.run('PRAGMA foreign_keys = ON;');

  if (!dbExists) {
    console.log('📦 Initializing Salon Database from DDL & INSERT scripts...');
    await initSchemaAndData(dbInstance);
  } else {
    console.log('✅ Salon Database loaded cleanly.');
  }

  return dbInstance;
}

function cleanPostgreSQLToSQLite(sql) {
  // Remove non-comment header text lines
  const lines = sql.split('\n');
  const cleanedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('Gr :') || trimmed.includes('DDL Script') || trimmed.includes('INSERT Script')) {
      return '-- ' + line;
    }
    return line;
  });

  let result = cleanedLines.join('\n');
  return result
    .replace(/--------------------------------------------------------------------------------/g, '-- ------------------------------------------------------------------------------')
    .replace(/CREATE SCHEMA DBMS_PROJECT;/gi, '')
    .replace(/SET SEARCH_PATH TO DBMS_PROJECT;/gi, '')
    .replace(/DATE '([^']+)'/gi, "'$1'")
    .replace(/TIMESTAMP '([^']+)'/gi, "'$1'")
    .replace(/TIME '([^']+)'/gi, "'$1'");
}

async function initSchemaAndData(db) {
  const ddlPath = path.join(__dirname, '../../../DDLScript.txt');
  const insertPath = path.join(__dirname, '../../../INSERTScript.txt');

  if (fs.existsSync(ddlPath)) {
    let ddlContent = fs.readFileSync(ddlPath, 'utf8');
    ddlContent = cleanPostgreSQLToSQLite(ddlContent);
    try {
      await db.exec(ddlContent);
      console.log('🧱 DDL Tables created successfully.');
    } catch (err) {
      console.error('DDL Error:', err.message);
    }
  }

  if (fs.existsSync(insertPath)) {
    let insertContent = fs.readFileSync(insertPath, 'utf8');
    insertContent = cleanPostgreSQLToSQLite(insertContent);

    try {
      await db.exec(insertContent);
      console.log('🌱 Seed Data loaded successfully.');
    } catch (err) {
      console.warn('INSERT note:', err.message);
    }
  }

  // Create Users table for authentication
  await db.exec(`
    CREATE TABLE IF NOT EXISTS AppUsers (
      User_ID INTEGER PRIMARY KEY AUTOINCREMENT,
      Email TEXT UNIQUE NOT NULL,
      Password TEXT NOT NULL,
      Role TEXT CHECK (Role IN ('admin', 'staff', 'customer')),
      Ref_ID INT
    );
  `);

  // Seed default demo accounts
  const hashedAdminPass = await bcrypt.hash('admin123', 10);
  const hashedStaffPass = await bcrypt.hash('staff123', 10);
  const hashedCustPass = await bcrypt.hash('customer123', 10);

  try {
    await db.run(
      `INSERT OR IGNORE INTO AppUsers (Email, Password, Role, Ref_ID) VALUES (?, ?, ?, ?)`,
      ['admin@salon.com', hashedAdminPass, 'admin', 701]
    );
    await db.run(
      `INSERT OR IGNORE INTO AppUsers (Email, Password, Role, Ref_ID) VALUES (?, ?, ?, ?)`,
      ['staff@salon.com', hashedStaffPass, 'staff', 201]
    );
    await db.run(
      `INSERT OR IGNORE INTO AppUsers (Email, Password, Role, Ref_ID) VALUES (?, ?, ?, ?)`,
      ['customer@salon.com', hashedCustPass, 'customer', 1001]
    );
    console.log('🔑 Demo authentication accounts initialized (Admin, Staff, Customer).');
  } catch (err) {
    console.error('Error seeding auth accounts:', err);
  }
}

module.exports = { getDB };
