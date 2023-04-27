import { describe, it } from "vitest";
import { Point } from "./point";

describe("Point", () => {
  it("Can compare and calc distance", ({ expect }) => {
    const p1 = new Point(0, 0);
    const p2 = new Point(1, 1);

    expect(p1.equals(p2)).toBe(false);

    const distance = p1.calcDistanceTo(p2);
    expect(distance).toBe(1.4142135623730951);

    const hDistance = p1.calcHorizontalDistanceTo(p2);
    expect(hDistance).toBe(1);

    const vDistance = p1.calcVerticalDistance(p2)
    expect(vDistance).toBe(1);

    expect(Math.pow(2, .5)).toBe(1.4142135623730951)
  });
});
