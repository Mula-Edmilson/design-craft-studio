import { useEffect, useState, useCallback } from "react";
import { getCart, cartCount, cartTotal, type CartItem } from "@/lib/api";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => getCart());
  const [count, setCount] = useState<number>(() => cartCount());
  const [total, setTotal] = useState<number>(() => cartTotal());

  const refresh = useCallback(() => {
    setItems(getCart());
    setCount(cartCount());
    setTotal(cartTotal());
  }, []);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("pp:cartUpdated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("pp:cartUpdated", handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  return { items, count, total, refresh };
}
