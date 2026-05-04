const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");
const path = require("path");

const dbPath = path.join(__dirname, "codesync.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection error:", err.message);
  } else {
    console.log("Connected to SQLite database");
    initializeDB();
  }
});

function initializeDB() {
  db.run(`
    CREATE TABLE IF NOT EXISTS rooms (
      roomId TEXT PRIMARY KEY,
      isPrivate INTEGER DEFAULT 0,
      passwordHash TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function createRoom(roomId, isPrivate, password) {
  return new Promise((resolve, reject) => {
    if (isPrivate && password) {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
          reject(err);
          return;
        }

        db.run(
          "INSERT INTO rooms (roomId, isPrivate, passwordHash) VALUES (?, ?, ?)",
          [roomId, 1, hash],
          (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({ roomId, isPrivate: true });
            }
          }
        );
      });
    } else {
      db.run(
        "INSERT INTO rooms (roomId, isPrivate, passwordHash) VALUES (?, ?, ?)",
        [roomId, 0, null],
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve({ roomId, isPrivate: false });
          }
        }
      );
    }
  });
}

function verifyRoomPassword(roomId, password) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM rooms WHERE roomId = ?", [roomId], (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        resolve({ valid: false, exists: false });
        return;
      }

      if (!row.isPrivate) {
        resolve({ valid: true, exists: true });
        return;
      }

      bcrypt.compare(password, row.passwordHash, (err, matches) => {
        if (err) {
          reject(err);
        } else {
          resolve({ valid: matches, exists: true });
        }
      });
    });
  });
}

function getRoomInfo(roomId) {
  return new Promise((resolve, reject) => {
    db.get("SELECT roomId, isPrivate FROM rooms WHERE roomId = ?", [roomId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

function roomExists(roomId) {
  return new Promise((resolve, reject) => {
    db.get("SELECT roomId FROM rooms WHERE roomId = ?", [roomId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(!!row);
      }
    });
  });
}

module.exports = {
  db,
  createRoom,
  verifyRoomPassword,
  getRoomInfo,
  roomExists,
};
