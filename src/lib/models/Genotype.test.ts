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
  it("should swap as expected if fromOppositeStrand", () => {
    const genotype1 = Genotype.fromString("CT");
    const genotype2 = Genotype.fromString("AG");
    assert(genotype1 != null, "genotype should not be null");
    assert(genotype2 != null, "genotype should not be null");
    expect(genotype1.fromOppositeStrand().matches(genotype2)).toBe(true);
  })
  it("should complement every nucleotide if fromOppositeStrand", () => {
    // Covers all four cases of the switch, in both directions.
    const pairs = [["AA", "TT"], ["TT", "AA"], ["CC", "GG"], ["GG", "CC"]];
    pairs.forEach(([input, expected]) => {
      const genotype = Genotype.fromString(input);
      const complement = Genotype.fromString(expected);
      assert(genotype != null, `${input} should not be null`);
      assert(complement != null, `${expected} should not be null`);
      expect(genotype.fromOppositeStrand().matches(complement)).toBe(true);
    });
  })
})