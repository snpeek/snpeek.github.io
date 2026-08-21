import { describe, it, expect } from 'vitest';
import { GeneDataParser } from './GeneDataParser';
import { IndexMap } from '$lib/parsing/parsing';
import type { MpsDataByRsid } from './MpsData';
import type { GeneVariant } from './GeneVariant';

// rs1801133 (MTHFR C677T) is one of the entries in static/mps/mps-data.json
// reported on the reverse strand. Values below are copied from that file.
const mpsData: MpsDataByRsid = {
  rs1801133: {
    phenotype: 'Methylation',
    gene: 'MTHFR',
    pathogenic: ['TT', 'CT'],
    onForwardStrand: false,
  },
};

// Mirrors the parser +page.svelte builds in onMount for the query-param path.
function queryParamParser(): GeneDataParser {
  const indexMap = new IndexMap({ rsidIndex: 0, genotypeIndex: 1 });
  return new GeneDataParser(indexMap.parser.bind(indexMap), '', mpsData);
}

// A forward-strand read of the pathogenic CT genotype.
const forwardStrandGenotype = 'AG';

// Mirrors queryParamsFromVariants in +page.svelte.
function toQueryParams(variants: GeneVariant[]): URLSearchParams {
  const params = new URLSearchParams();
  variants.forEach((variant) => {
    if (variant.genotype != null) {
      params.set(variant.rsid, variant.genotype.toString());
    }
  });
  return params;
}

describe('a reverse-strand variant survives the query-param round trip', () => {
  it('keeps its pathogenic match when parsed from a CSV', () => {
    const indexMap = new IndexMap({ rsidIndex: 0, genotypeIndex: 1 });
    const before = indexMap.parser([['rs1801133', forwardStrandGenotype]], mpsData);
    const after = queryParamParser().parseQueryParams(toQueryParams(before));

    expect(before[0].pathogenicAllele?.toString()).toBe('CT');
    expect(after[0].pathogenicAllele?.toString()).toBe('CT');
  });

  it('keeps its pathogenic match when parsed from a VCF', () => {
    // CHROM POS ID REF ALT QUAL FILTER INFO FORMAT SAMPLE
    const vcfRow = ['1', '11856378', 'rs1801133', 'A', 'G', '.', '.', '.', 'GT', '0/1'];
    const before = GeneDataParser.parseVCFData([vcfRow], mpsData);
    const after = queryParamParser().parseQueryParams(toQueryParams(before));

    expect(before[0].pathogenicAllele?.toString()).toBe('CT');
    expect(after[0].pathogenicAllele?.toString()).toBe('CT');
  });
});

describe('parseQueryParams', () => {
  it('ignores keys inherited from Object.prototype', () => {
    // A link ending in ?toString=A1 used to reach Object.prototype.toString
    // and throw, which discarded every other variant in the URL.
    const params = new URLSearchParams('toString=A1&rs1801133=AG');
    const variants = queryParamParser().parseQueryParams(params);

    expect(variants.map((variant) => variant.rsid)).toEqual(['rs1801133']);
  });
});
