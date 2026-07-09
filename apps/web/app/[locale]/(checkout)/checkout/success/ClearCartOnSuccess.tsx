"use client";

import { useEffect } from "react";
import { useCartStore } from "@/src/lib/cart/store";

/** Empties the cart once the user lands on the success page. */
export function ClearCartOnSuccess() {
  useEffect(() => {
    useCartStore.getState().removeItem();
  }, []);

  return null;
}
