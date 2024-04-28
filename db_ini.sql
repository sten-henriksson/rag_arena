-- Filename: create_full_db.sql


CREATE TABLE ultimate_truth_question (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    optimal_answer_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_model (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_model_answer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER,
    model_id INTEGER,
    answer_text TEXT NOT NULL,
    selected INTEGER
    skipped INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES ultimate_truth_question (id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES ai_model (id) ON DELETE CASCADE
);
