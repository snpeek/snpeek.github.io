import { describe, it, expect } from 'vitest';
import { IndexMap } from './parsing';

describe('Parsing Test', () => {
  const valueBattery: Record<string, ('snp' | 'genotype' | 'position' | 'chromosome' | 'nucleotide' | null)> = {
    'rs4680': 'snp',
    'ilmnseq_rs46801234125': 'snp',
    'dupseq-rs4680': 'snp',
    'GG': 'genotype',
    'AA': 'genotype',
    'AT': 'genotype',
    'G': 'nucleotide',
    '1': 'chromosome',
    '01': 'chromosome',
    '20': 'chromosome',
    'XX': 'chromosome',
    'XY': 'chromosome',
    '4680': 'position',
    '21556106': 'position',
    '16954110': 'position',
    '111': 'position',
    'FXXBAR': null
  }
  it('should infer if the data is an SNP', function (done) {
    for (const cellValue in valueBattery) {
      if (!Object.hasOwn(valueBattery, cellValue)) continue;

      const column = valueBattery[cellValue];
      expect(IndexMap.isColumnSnp(cellValue), cellValue).toBe(column == 'snp');
    }
  });

  it('should infer if the data is a chromosome', function (done) {
    for (const cellValue in valueBattery) {
      if (!Object.hasOwn(valueBattery, cellValue)) continue;

      const column = valueBattery[cellValue];
      expect(IndexMap.isColumnChromosome(cellValue), cellValue).toBe(column == 'chromosome');
    }
  });

  it('should infer if the data is a genotype', function (done) {
    for (const cellValue in valueBattery) {
      if (!Object.hasOwn(valueBattery, cellValue)) continue;

      const column = valueBattery[cellValue];
      expect(IndexMap.isColumnGenotype(cellValue), cellValue).toBe(column == 'genotype');
    }
  });

  it('should infer if the data is a nucleotide', function (done) {
    for (const cellValue in valueBattery) {
      if (!Object.hasOwn(valueBattery, cellValue)) continue;

      const column = valueBattery[cellValue];
      expect(IndexMap.isColumnNucleotide(cellValue), cellValue).toBe(column == 'nucleotide');
    }
  });

  it('should infer if the data is a position', function (done) {
    for (const cellValue in valueBattery) {
      if (!Object.hasOwn(valueBattery, cellValue)) continue;

      const column = valueBattery[cellValue];
      expect(IndexMap.isColumnPosition(cellValue), cellValue).toBe(column == 'position');
    }
  });

  it("should properly parse 23andme", function (done) {
    expect(IndexMap.fromSampleRow(['rs9999999', '1', '100000089', 'AA']))
      .toStrictEqual(new IndexMap({
        rsidIndex: 0,
        chromosomeIndex: 1,
        positionIndex: 2,
        genotypeIndex: 3,
        nucleotide1Index: -1,
        nucleotide2Index: -1
      }));
  });
  it("should properly parse ancestry", function (done) {
    expect(IndexMap.fromSampleRow(['rs9999999', '1', '100000089', 'A', 'A']))
      .toStrictEqual(new IndexMap({
        rsidIndex: 0,
        chromosomeIndex: 1,
        positionIndex: 2,
        genotypeIndex: -1,
        nucleotide1Index: 3,
        nucleotide2Index: 4
      }));
  })
});