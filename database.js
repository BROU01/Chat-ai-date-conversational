const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(process.env.SQLITE_PATH || path.join(__dirname, 'data.sqlite'));
const dbHelpers = {
  getStats() {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.get('SELECT COUNT(*) AS totalUsers FROM users', (error, users) => {
          if (error) return reject(error);
          db.get('SELECT COUNT(*) AS totalMessages FROM messages', (messageError, messages) => {
            if (messageError) return reject(messageError);
            resolve({ totalUsers: users?.totalUsers || 0, totalMessages: messages?.totalMessages || 0, totalConversations: 0, messagesToday: 0, activeUsers: 0 });
          });
        });
      });
    });
  },
  getConversations() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM messages ORDER BY createdAt DESC', (error, rows) => error ? reject(error) : resolve(rows || []));
    });
  }
};

module.exports = { db, dbHelpers };
