"use server";
import { revalidatePath } from "next/cache";

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function submitMessageForm(x: number) {
  await delay(2000);
  revalidatePath("/");
}
