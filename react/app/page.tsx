import { Arena } from "./Arena/Arena";
import { Suspense } from "react";
import {MessageList} from "./GET_STUFF"

export default function Home() {
  
  return (
    <>
      <Arena />
      <Suspense fallback={<p>Loading messages…</p>}>
        <MessageList></MessageList>
        <></>
      </Suspense>
    </>
  );
}
