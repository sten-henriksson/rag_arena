"use server";
import { revalidatePath } from "next/cache";
import { submitBest } from "../db_service";
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function post(x: { selected: boolean; id: number }[]) {
  await delay(500)
  await submitBest(x);
  revalidatePath("/");
}
