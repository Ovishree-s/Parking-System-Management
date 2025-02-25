const Database = require('better-sqlite3');
const db = new Database('database.db');

// Function to create reservations table if it doesn't exist
function createTable() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL
        );
    `);
}

// Function to insert a new reservation
function insertReservation(user_name, date, time) {
    const stmt = db.prepare('INSERT INTO reservations (user_name, date, time) VALUES (?, ?, ?)');
    stmt.run(user_name, date, time);
}

// Function to get all reservations
function getAllReservations() {
    return db.prepare('SELECT * FROM reservations').all();
}

// Function to update a reservation
function updateReservation(id, user_name, date, time) {
    const stmt = db.prepare('UPDATE reservations SET user_name = ?, date = ?, time = ? WHERE id = ?');
    const result = stmt.run(user_name, date, time, id);
    return result.changes > 0;  // Returns true if the update was successful
}

// Function to delete a reservation
function deleteReservation(id) {
    const stmt = db.prepare('DELETE FROM reservations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;  // Returns true if deletion was successful
}

module.exports = { createTable, insertReservation, getAllReservations, updateReservation, deleteReservation };
