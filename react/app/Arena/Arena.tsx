"use client";
// filename: Arena.tsx

import { useState, useCallback } from "react";
import { post } from "./server";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/**
 * Component for handling data operations with visual feedback.
 * @param prop {q_a: {id: number, selected: boolean}[]} - Array of question and answer objects.
 */
export function Arena(prop: { q_a: { id: number, selected: boolean, answer: string,selected_number:number }[] }) {
  const [loading, setLoading] = useState<boolean>(false);
  /**
   * Load data by posting each item in prop.q_a.
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    // Map each item to a promise and wait for all of them to resolve
    await Promise.all(
      prop.q_a.map(x => post([{ id: x.id, selected: x.selected }]))
    );
    setLoading(false);
  }, [prop.q_a]);

  return (
    <div className="flex">
      {
        prop.q_a.map((x) => 
          <div className="w-1/3">
          <Card>
          <CardHeader>
            <CardTitle>{x.answer }</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>
                score:{x.selected_number}
              </p>
            ) : (
              <button onClick={loadData}>
                Load Data
              </button>
            )}
          </CardContent>
        </Card>
        </div>
        )
      }
    </div>
  );
}
