import { getAIModelAnswers } from "./db_service";
export const revalidate = false
export async function MessageList() {
  const data = await getAIModelAnswers();

  return (
    <>
      <p>{data.map((x) => JSON.stringify(x))}</p>
    </>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
