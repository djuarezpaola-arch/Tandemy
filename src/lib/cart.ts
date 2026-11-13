import { useSyncExternalStore } from "react";

export type CartItem = { slug: string; title: string; price: number; qty: number };

const KEY = "tandemy-cart";
const EVENT = "tandemy-cart-change";
const EMPTY: CartItem[] = [];
let cache: { raw: string | null; items: CartItem[] } = { raw: null, items: EMPTY };

function read(): CartItem[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.items;
  let items: CartItem[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) items = parsed;
  } catch {
    items = EMPTY;
  }
  cache = { raw, items };
  return items;
}

function write(items: CartItem[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(EVENT));
}

export function addToCart(items: CartItem[], item: Omit<CartItem, "qty">, qty: number): CartItem[] {
  const existing = items.find((i) => i.slug === item.slug);
  if (existing) return items.map((i) => (i.slug === item.slug ? { ...i, qty: i.qty + qty } : i));
  return [...items, { ...item, qty }];
}

export function setQty(items: CartItem[], slug: string, qty: number): CartItem[] {
  return qty <= 0
    ? items.filter((i) => i.slug !== slug)
    : items.map((i) => (i.slug === slug ? { ...i, qty } : i));
}

export function clearCart(): CartItem[] {
  return [];
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.qty, 0);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    items,
    add: (item: Omit<CartItem, "qty">, qty = 1) => write(addToCart(read(), item, qty)),
    update: (slug: string, qty: number) => write(setQty(read(), slug, qty)),
    clear: () => write(clearCart()),
  };
}
