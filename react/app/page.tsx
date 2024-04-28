import { Arena } from "./Arena/Arena";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Arena />
      <Suspense fallback={<p>Loading messages…</p>}>
        <></>
      </Suspense>
    </>
  );
}
