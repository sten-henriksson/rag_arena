export type AIModelAnswer = {
    answer_id: number;
    answer_text: string;
    selected: number;
    skipped: number;
    question_text: string;
    optimal_answer_text: string;
    model_name: string;
  };