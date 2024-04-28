"use client";
import { submitMessageForm } from "./server";
import { useState, useCallback } from "react";

export function Arena() {
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async (id: number) => {
    setLoading(true);
    const result = await submitMessageForm(0);
    setLoading(false);
  };
  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <button
          onClick={() => {
            loadData(1);
          }}
        >
          Load Data
        </button>
      )}
    </div>
  );
}
