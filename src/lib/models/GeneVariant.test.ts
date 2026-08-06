import { describe, it, expect } from 'vitest';
import { GeneDataParser } from './GeneDataParser';
import { IndexMap } from '$lib/parsing/parsing';
import type { MpsDataByRsid } from './MpsData';

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

describe('parseQueryParams', () => {
  it('ignores keys inherited from Object.prototype', () => {
    // A link ending in ?toString=A1 used to reach Object.prototype.toString
    // and throw, which discarded every other variant in the URL.
    const params = new URLSearchParams('toString=A1&rs1801133=AG');
    const variants = queryParamParser().parseQueryParams(params);

    expect(variants.map((variant) => variant.rsid)).toEqual(['rs1801133']);
  });
});
