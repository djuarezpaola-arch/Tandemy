import { describe, expect, it } from "vitest";
import { parseSkillsInput, authErrorToSpanish } from "@/lib/tandemy-db";
import {
  computeFeeBreakdown,
  formatMxn,
  PAYMENT_METHODS,
  PAYMENT_STATUS_LABEL,
  DEGREES,
  PROJECT_AREAS,
} from "@/lib/tandemy-types";

describe("Tandemy platform business logic", () => {
  it("computes the 10% platform commission and 90% student net amount accurately", () => {
    expect(computeFeeBreakdown(2000)).toEqual({
      amount: 2000,
      platformFee: 200,
      studentNetAmount: 1800,
    });
    expect(computeFeeBreakdown(1555)).toEqual({
      amount: 1555,
      platformFee: 156,
      studentNetAmount: 1399,
    });
    expect(computeFeeBreakdown(-50)).toEqual({
      amount: 0,
      platformFee: 0,
      studentNetAmount: 0,
    });
  });

  it("exposes all 5 simulated payment methods and payment lifecycle statuses", () => {
    expect(PAYMENT_METHODS.map((m) => m.id)).toEqual([
      "credit_card",
      "debit_card",
      "oxxo",
      "bank_transfer",
      "digital_wallet",
    ]);
    expect(Object.keys(PAYMENT_STATUS_LABEL)).toEqual([
      "pending",
      "paid",
      "pending_release",
      "released",
      "cancelled",
    ]);
  });

  it("parses comma/semicolon/newline skills cleanly", () => {
    expect(parseSkillsInput("Excel, Costos; Power BI\nCanva,  ")).toEqual([
      "Excel",
      "Costos",
      "Power BI",
      "Canva",
    ]);
  });

  it("formats currency in MXN and keeps FCA degrees & areas defined", () => {
    expect(formatMxn(1500)).toContain("1,500");
    expect(formatMxn(1500)).toContain("MXN");
    expect(DEGREES).toHaveLength(6);
    expect(PROJECT_AREAS.length).toBeGreaterThanOrEqual(6);
  });

  it("maps Firebase auth error codes to clear Spanish feedback", () => {
    expect(authErrorToSpanish({ code: "auth/email-already-in-use" })).toContain("Ya existe");
    expect(authErrorToSpanish({ code: "auth/invalid-credential" })).toContain("incorrectos");
    expect(authErrorToSpanish({ code: "auth/operation-not-allowed" })).toContain("Email/Password");
  });
});
