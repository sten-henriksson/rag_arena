import { Arena } from "./Arena/Arena";
import { getAIModelAnswers } from "./db_service";
export const revalidate = false;
export async function MessageList() {
  const data = await getAIModelAnswers();

  return (
    <>
      <p>
        {data[0].question_text}
        {data[0].optimal_answer_text}
      </p>
      {data.map((x) => {
        return (
          <>
            <p>
              {x.optimal_answer_text + ":" + x.model_name + " " + x.answer_id+" "+x.selected}
            </p>
            <Arena
              q_a={data.map((y) => {
                return {
                  id: y.answer_id,
                  selected: y.answer_id == x.answer_id,
                };
              })}
            />
          </>
        );
      })}
    </>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
