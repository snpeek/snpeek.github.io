import { assert, describe, expect, expectTypeOf, it, test } from "vitest";
import { Genotype } from "./Genotype";

describe("Tests on Genotype", () => {
  it("should properly instantiate if valid nucleotides", () => {
    const genotype = Genotype.fromString("CT");
    expect(genotype).not.toBe(null);
  })
  it("should be null if invalid nucleotides", () => {
    const genotype = Genotype.fromString("YZ");
    expect(genotype).toBe(null);
  })
  it("should match if same", () => {
    const genotype1 = Genotype.fromString("CT");
    const genotype2 = Genotype.fromString("CT");
    assert(genotype1 != null, "genotype should not be null");
    assert(genotype2 != null, "genotype should not be null");
    expect(genotype1.matches(genotype1)).toBe(true);
    expect(genotype2.matches(genotype2)).toBe(true);
    expect(genotype1.matches(genotype2)).toBe(true);
    expect(genotype2.matches(genotype1)).toBe(true);
  })
  it("should match if flipped", () => {
    const genotype1 = Genotype.fromString("CT");
    const genotype2 = Genotype.fromString("TC");
    assert(genotype1 != null, "genotype should not be null");
    assert(genotype2 != null, "genotype should not be null");
    expect(genotype1.matches(genotype1)).toBe(true);
    expect(genotype2.matches(genotype2)).toBe(true);
    expect(genotype1.matches(genotype2)).toBe(true);
    expect(genotype2.matches(genotype1)).toBe(true);
  })
  it("should not match if different", () => {
    const genotype1 = Genotype.fromString("CT");
    const genotype2 = Genotype.fromString("AG");
    assert(genotype1 != null, "genotype should not be null");
    assert(genotype2 != null, "genotype should not be null");
    expect(genotype1.matches(genotype2)).toBe(false);
    expect(genotype2.matches(genotype1)).toBe(false);
  })
})