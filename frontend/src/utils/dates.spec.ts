import { describe, expect, it } from "vitest";
import { parseTimestamp, formatTimestamp } from "./dates";

describe("dates utils", () => {
  it("formats hours and minutes with zero padding", () => {
    const date = new Date(2023, 4, 1, 7, 5);
    expect(parseTimestamp(date, "HH:mm")).toBe("07:05");
  });

  it("formats day/month/year when not same day", () => {
    const date = new Date(2023, 9, 31, 16, 45);
    expect(parseTimestamp(date, "DD/MM/YY")).toBe("31/10/2023");
  });

  it("indicates today when reference date matches current day", () => {
    const now = new Date();
    now.setHours(11, 15, 0, 0);
    expect(formatTimestamp(new Date(), now)).toMatch(/^Today, \d{2}:\d{2}$/);
  });

  it("returns calendar date when reference date is in the past", () => {
    const reference = new Date(2020, 0, 1, 8, 0, 0, 0);
    const timestamp = new Date(2020, 0, 1, 8, 0, 0, 0);
    const formatted = formatTimestamp(reference, timestamp);
    expect(formatted).toBe("01/01/2020");
  });
});
