
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../ultimateTruth.db');

db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE ultimate_truth_question (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_text TEXT NOT NULL,
        optimal_answer_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    db.run(`CREATE TABLE ai_model (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`);

    db.run(`CREATE TABLE ai_model_answer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question_id INTEGER,
        model_id INTEGER,
        answer_text TEXT NOT NULL,
        selected INTEGER,
        skipped INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (question_id) REFERENCES ultimate_truth_question (id) ON DELETE CASCADE,
        FOREIGN KEY (model_id) REFERENCES ai_model (id) ON DELETE CASCADE
    );`);

    // Insert random data
    const questions = [
        { question: "What is the meaning of life?", answer: "42" },
        { question: "Is the universe finite?", answer: "Undetermined" }
    ];
    const models = [
        { name: "GPT-4" },
        { name: "BERT" }
    ];

    questions.forEach(q => {
        db.run('INSERT INTO ultimate_truth_question (question_text, optimal_answer_text) VALUES (?, ?)', [q.question, q.answer]);
    });

    models.forEach(m => {
        db.run('INSERT INTO ai_model (model_name) VALUES (?)', [m.name]);
    });

    // Assuming that data has already been inserted and ids are known for simplicity
    db.run('INSERT INTO ai_model_answer (question_id, model_id, answer_text, selected, skipped) VALUES (1, 1, "42", 1, 0)');
    db.run('INSERT INTO ai_model_answer (question_id, model_id, answer_text, selected, skipped) VALUES (2, 2, "Maybe", 0, 1)');
});

db.close();
