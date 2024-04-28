"use client";
import { post } from "./server";
import { useState, useCallback } from "react";

export function Arena() {
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async (id: number) => {
    setLoading(true);
    const result = await post([{ id: 0, selected: true }]);
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
