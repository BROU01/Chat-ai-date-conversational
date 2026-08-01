const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'emiliana.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('✓ Connecté à la base de données SQLite');
        initializeTables();
    }
});

function initializeTables() {
    // Table utilisateurs
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            photo TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            lastActivityDate TEXT,
            messagesToday INTEGER DEFAULT 0,
            lastMessageDate TEXT
        )
    `, (err) => {
        if (err) console.error('Erreur création table users:', err.message);
    });

    // Table messages
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            companionId TEXT,
            companionName TEXT,
            companionArchetype TEXT,
            userMessage TEXT NOT NULL,
            botResponse TEXT,
            provider TEXT,
            type TEXT DEFAULT 'chat',
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Erreur création table messages:', err.message);
    });

    // Table companions
    db.run(`
        CREATE TABLE IF NOT EXISTS companions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            name TEXT NOT NULL,
            gender TEXT NOT NULL,
            personality TEXT NOT NULL,
            attributes TEXT,
            photo TEXT,
            createdAt TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (userId) REFERENCES users(id)
        )
    `, (err) => {
        if (err) console.error('Erreur création table companions:', err.message);
    });

    // Créer admin par défaut si n'existe pas
    createAdminIfNotExists();
}

function createAdminIfNotExists() {
    db.get("SELECT * FROM users WHERE username = 'admin'", (err, row) => {
        if (!row) {
            bcrypt.hash('Admin123', 12, (err, hash) => {
                if (!err) {
                    db.run(
                        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                        ['admin', 'admin@emiliana.com', hash, 'admin'],
                        (err) => {
                            if (!err) console.log('✓ Administrateur créé (admin/Admin123)');
                        }
                    );
                }
            });
        }
    });
}

// Fonctions utilitaires pour la base de données
const dbHelpers = {
    // Users
    createUser: (username, email, password, role = 'user') => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 12, (err, hash) => {
                if (err) return reject(err);
                db.run(
                    "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
                    [username, email, hash, role],
                    function(err) {
                        if (err) return reject(err);
                        resolve({ id: this.lastID, username, email, role });
                    }
                );
            });
        });
    },

    findUserByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = ? OR email = ?", [username, username], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    },

    getUserById: (id) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    },

    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT id, username, email, role, createdAt, messagesToday, lastActivityDate FROM users", (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    updateUserActivity: (id) => {
        return new Promise((resolve, reject) => {
            const today = new Date().toISOString().split('T')[0];
            db.run(
                "UPDATE users SET lastActivityDate = datetime('now'), lastMessageDate = ? WHERE id = ?",
                [today, id],
                function(err) {
                    if (err) return reject(err);
                    resolve();
                }
            );
        });
    },

    incrementMessageCount: (id) => {
        return new Promise((resolve, reject) => {
            const today = new Date().toISOString().split('T')[0];
            db.get("SELECT lastMessageDate, messagesToday FROM users WHERE id = ?", [id], (err, row) => {
                if (err) return reject(err);
                if (!row) return resolve();
                
                if (row.lastMessageDate !== today) {
                    db.run("UPDATE users SET messagesToday = 1, lastMessageDate = ? WHERE id = ?", [today, id]);
                } else {
                    db.run("UPDATE users SET messagesToday = messagesToday + 1 WHERE id = ?", [id]);
                }
                resolve();
            });
        });
    },

    // Messages
    saveMessage: (userId, companionName, companionArchetype, userMessage, botResponse, provider, type = 'chat') => {
        return new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO messages (userId, companionName, companionArchetype, userMessage, botResponse, provider, type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [userId, companionName, companionArchetype, userMessage, botResponse, provider, type],
                function(err) {
                    if (err) return reject(err);
                    resolve({ id: this.lastID });
                }
            );
        });
    },

    getUserMessages: (userId) => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM messages WHERE userId = ? ORDER BY createdAt DESC", [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    getAllMessages: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM messages ORDER BY createdAt DESC", (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    },

    // Companions
    saveCompanion: (userId, name, gender, personality, attributes, photo) => {
        return new Promise((resolve, reject) => {
            const attributesStr = JSON.stringify(attributes);
            db.run(
                "INSERT INTO companions (userId, name, gender, personality, attributes, photo) VALUES (?, ?, ?, ?, ?, ?)",
                [userId, name, gender, personality, attributesStr, photo],
                function(err) {
                    if (err) return reject(err);
                    resolve({ id: this.lastID, name, gender, personality, attributes });
                }
            );
        });
    },

    getUserCompanions: (userId) => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM companions WHERE userId = ?", [userId], (err, rows) => {
                if (err) return reject(err);
                resolve(rows.map(r => ({
                    ...r,
                    attributes: r.attributes ? JSON.parse(r.attributes) : []
                })));
            });
        });
    },

    updateCompanion: (id, name, gender, personality, attributes, photo) => {
        return new Promise((resolve, reject) => {
            const attributesStr = JSON.stringify(attributes);
            db.run(
                "UPDATE companions SET name = ?, gender = ?, personality = ?, attributes = ?, photo = ? WHERE id = ?",
                [name, gender, personality, attributesStr, photo, id],
                function(err) {
                    if (err) return reject(err);
                    resolve({ id, name, gender, personality, attributes });
                }
            );
        });
    },

    deleteCompanion: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM companions WHERE id = ?", [id], function(err) {
                if (err) return reject(err);
                resolve();
            });
        });
    }
};

module.exports = dbHelpers;

    // Stats
    getStats: () => {
        return new Promise((resolve, reject) => {
            const today = new Date().toISOString().split('T')[0];
            db.get("SELECT COUNT(*) as total FROM users", (err, row) => {
                if (err) return reject(err);
                const totalUsers = row?.total || 0;
                
                db.get("SELECT COUNT(*) as total FROM messages", (err, row) => {
                    if (err) return reject(err);
                    const totalMessages = row?.total || 0;
                    
                    db.get("SELECT SUM(messagesToday) as today FROM users WHERE lastMessageDate = ?", [today], (err, row) => {
                        if (err) return reject(err);
                        const messagesToday = row?.today || 0;
                        
                        db.get("SELECT COUNT(*) as total FROM (SELECT userId FROM messages WHERE createdAt >= datetime('now', '-24 hours') GROUP BY userId)", (err, row) => {
                            if (err) return reject(err);
                            const activeUsers = row?.total || 0;
                            
                            // Compter les conversations uniques
                            db.get("SELECT COUNT(DISTINCT userId || '-' || companionName) as total FROM messages", (err, row) => {
                                if (err) return reject(err);
                                resolve({
                                    totalUsers,
                                    totalMessages,
                                    totalConversations: row?.total || 0,
                                    messagesToday,
                                    activeUsers
                                });
                            });
                        });
                    });
                });
            });
        });
    },

    getConversations: () => {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT m.userId, u.username, m.companionName, m.userMessage as lastMessage, m.createdAt
                FROM messages m
                JOIN users u ON m.userId = u.id
                ORDER BY m.createdAt DESC
            `, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }
};

module.exports = { db, dbHelpers };