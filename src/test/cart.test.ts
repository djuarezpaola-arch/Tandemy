import { describe, expect, it } from "vitest";
import { addToCart, cartCount, cartTotal, clearCart, setQty } from "@/lib/cart";

const costos = {
  slug: "costos-punto-equilibrio",
  title: "Plantilla Maestra de Costos",
  price: 149,
};
const cv = { slug: "portafolio-cv", title: "Kit Portafolio Pro", price: 89 };

describe("cart", () => {
  it("adds the chosen quantity and merges repeated products", () => {
    const items = addToCart(addToCart([], costos, 2), costos, 1);
    expect(items).toHaveLength(1);
    expect(items[0]?.qty).toBe(3);
  });

  it("totals price times quantity across products", () => {
    const items = addToCart(addToCart([], costos, 2), cv, 1);
    expect(cartTotal(items)).toBe(149 * 2 + 89);
    expect(cartCount(items)).toBe(3);
  });

  it("removes a product when its quantity drops to zero", () => {
    expect(setQty(addToCart([], cv, 1), cv.slug, 0)).toEqual([]);
  });

  it("clears all items cleanly after checkout", () => {
    expect(clearCart()).toEqual([]);
  });
});
