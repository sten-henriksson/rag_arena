
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../ultimateTruth.db');

db.serialize(() => {
    // Create tables
    db.run(`
    CREATE TABLE ai_model (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE ultimate_truth_question (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL UNIQUE,
        optimal_answer_text TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE ai_model_answer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        model_id INTEGER,
        answer_text TEXT NOT NULL,
        selected INTEGER DEFAULT 0,
        skipped INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_id, model_id),
        FOREIGN KEY (question_id) REFERENCES ultimate_truth_question (id) ON DELETE CASCADE,
        FOREIGN KEY (model_id) REFERENCES ai_model (id) ON DELETE CASCADE
    );
    
    `);
    db.run(`
 
    
    CREATE TABLE ultimate_truth_question (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL UNIQUE,
        optimal_answer_text TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
 
    
    `);
    db.run(`

    
    CREATE TABLE ai_model_answer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        model_id INTEGER,
        answer_text TEXT NOT NULL,
        selected INTEGER DEFAULT 0,
        skipped INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(question_id, model_id),
        FOREIGN KEY (question_id) REFERENCES ultimate_truth_question (id) ON DELETE CASCADE,
        FOREIGN KEY (model_id) REFERENCES ai_model (id) ON DELETE CASCADE
    );
    
    `);

});

db.close();
