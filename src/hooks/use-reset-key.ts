"use client";

import { useState } from "react";

/** Returns true for the render where `resetKey` changes so local state can be reinitialized. */
export function useResetKey(resetKey: unknown): boolean {
  const [prevKey, setPrevKey] = useState(resetKey);

  if (!Object.is(prevKey, resetKey)) {
    setPrevKey(resetKey);
    return true;
  }

  return false;
}
