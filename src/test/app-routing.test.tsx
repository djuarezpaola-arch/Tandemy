import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });
});

describe("Linked pages", () => {
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
  const linked = [
    "/proyectos",
    "/perfiles",
    "/tienda",
    "/registro",
    "/panel-estudiante",
    "/panel-pyme",
    "/reset-password",
    "/faq",
    "/contacto",
    "/tienda/costos-punto-equilibrio",
    "/tienda/portafolio-cv",
  ];
  for (const path of linked) {
    it(`has a page for ${path}`, () => {
      expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
    });
  }
  it("opens product pages separately from the store list", () => {
    expect(router.matchRoutes("/tienda/portafolio-cv").at(-1)?.routeId).toBe("/tienda_/$slug");
  });
});
