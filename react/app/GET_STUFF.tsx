import { Arena } from "./Arena/Arena";
import { getAIModelAnswers, getTopAIModelAnswers } from "./db_service";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"



export const revalidate = false;
export async function MessageList() {
  const data = await getAIModelAnswers();
  const leaderboard = await getTopAIModelAnswers();
  return (
    <>
      <div className="flex justify-center">
        <Card className="w-1/3">
          <CardContent>
            <CardTitle>{data[0].question_text}</CardTitle>
            {data[0].optimal_answer_text}
          </CardContent>
        </Card>
      </div>
      <Arena
        q_a={data.map((y) => {
          return {
            id: y.answer_id,
            selected: false,
            answer: y.answer_text,
            selected_number: y.selected,
          };
        })}
      />
      <div className="flex justify-center">
        <Card className="w-2/3">

          <CardContent>
            <div className="flex justify-center">
              <table>
                <tbody>
                  <tr>
                    <th>Question</th>
                    <th>Model</th>
                    <th>+</th>
                    <th>-</th>
                  </tr>
                  {leaderboard.map((x) => (
                    <tr>
                      <td className="px-10">{x.model_name}</td>
                      <td className="px-10">{x.question_text}</td>
                      <td className="px-10">{x.selected}</td>
                      <td className="px-10">{x.skipped}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
