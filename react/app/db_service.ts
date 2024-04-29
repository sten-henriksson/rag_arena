import Database from "better-sqlite3";
import { AIModelAnswer } from "./type";

export async function submitBest(x: { selected: boolean; id: number }[]) {
  // incrementd skipped if selected is false
  // increment selected if selected is true
  const db = new Database("/home/stenadg/src/rag_arena/ultimateTruth.db");
  x.forEach((x) => {
    const stmt = db.prepare(
      x.selected
        ? `
    UPDATE ai_model_answer
    SET selected = selected + 1
    WHERE id = ?
  `
        : `
    UPDATE ai_model_answer
    SET skipped = skipped + 1
    WHERE id = ?
  `
    );
    const info = stmt.run(x.id);
    console.log("update", info);
  });
  await delay(100);
}

type QuestionIdResult = {
  id: number; // Matches the type of the 'id' column in the ultimate_truth_question table
};
export function getAIModelAnswers(): AIModelAnswer[] {
  const db = new Database("/home/stenadg/src/rag_arena/ultimateTruth.db");
  const questionQuery = `
        SELECT id
        FROM ultimate_truth_question
        ORDER BY RANDOM()
        LIMIT 1
    `;
  const questionResult = db.prepare(questionQuery).get() as QuestionIdResult;
  console.log(questionResult);
  if (!questionResult) {
    // If no question was found, return an empty array
    return [];
  }

  console.log(questionResult);
  const selectedQuestionId = questionResult.id;

  // Retrieve up to three answers for the selected question
  const answersQuery = `
        SELECT 
            a.id AS answer_id,
            a.answer_text,
            a.selected,
            a.skipped,
            q.question_text,
            q.optimal_answer_text,
            m.model_name
        FROM ai_model_answer a
        JOIN ultimate_truth_question q ON a.question_id = q.id
        JOIN ai_model m ON a.model_id = m.id
        WHERE q.id = ?
        LIMIT 3
    `;
  const a = db.prepare(answersQuery).all(selectedQuestionId) as AIModelAnswer[];
  console.log(a);
  return a;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
