// Filename: database_operations.js

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const db = new sqlite3.Database('../ultimateTruth.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Database connected.');
    }
});

/**
 * Upsert model based on model name uniqueness.
 */
function upsertModel(modelName) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO ai_model (model_name) VALUES (?) ON CONFLICT(model_name) DO UPDATE SET model_name=excluded.model_name;`, [modelName], function (err) {
            if (err) {
                reject(err);
            } else {
                // To fetch the ID of an upserted row, we have to query it separately as SQLite doesn't support RETURNING directly in ON CONFLICT.
                db.get(`SELECT id FROM ai_model WHERE model_name = ?`, [modelName], (err, row) => {
                    if (err) reject(err);
                    else resolve(row.id);
                });
            }
        });
    });
}

/**
 * Upsert question based on question text uniqueness.
 */
function upsertQuestion(questionText, optimalAnswerText) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO ultimate_truth_question (question_text, optimal_answer_text) VALUES (?, ?) ON CONFLICT(question_text) DO UPDATE SET optimal_answer_text=excluded.optimal_answer_text;`, [questionText, optimalAnswerText], function (err) {
            if (err) {
                reject(err);
            } else {
                db.get(`SELECT id FROM ultimate_truth_question WHERE question_text = ?`, [questionText], (err, row) => {
                    if (err) reject(err);
                    else resolve(row.id);
                });
            }
        });
    });
}

/**
 * Insert or update an answer in the ai_model_answer table.
 * @param {number} questionID - The ID of the question.
 * @param {number} modelID - The ID of the model.
 * @param {string} answerText - The answer text.
 */
function upsertAnswer(questionID, modelID, answerText) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO ai_model_answer (question_id, model_id, answer_text) VALUES (?, ?, ?) ON CONFLICT(question_id, model_id) DO UPDATE SET answer_text = excluded.answer_text`;
        db.run(query, [questionID, modelID, answerText], function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}   

/**
 * Process each row from the CSV file.
 * @param {string} modelName - The name of the model.
 * @param {string} questionText - The question text.
 * @param {string} answerText - The answer text.
 * @param {string} optimalAnswerText - The optimal answer text.
 */
async function processRow(modelName, questionText, answerText, optimalAnswerText) {
    try {
        const modelID = await upsertModel(modelName);
        const questionID = await upsertQuestion(questionText, optimalAnswerText);
        await upsertAnswer(questionID, modelID, answerText);
        console.log(`Processed row: ${modelName}, ${questionText}`);
    } catch (error) {
        console.error('Failed to process row', error);
    }
}

fs.createReadStream(path.resolve(__dirname, 'data.csv'))
    .pipe(csv())
    .on('data', (row) => {
        processRow(row['model_name'], row['question'], row['answer'], row['optimal_answer']);
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        db.close();
    });
