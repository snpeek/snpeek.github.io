import { describe, it, expect } from 'vitest';
import { IndexMap } from './parsing';

describe('Parsing Test', () => {
  it('should infer if the data is an SNP', function (done) {
    expect(IndexMap.isColumnSnp('rs4680')).toBe(true);
    expect(IndexMap.isColumnSnp('ilmnseq_rs373025151')).toBe(true);

    expect(IndexMap.isColumnSnp('GG')).toBe(false);
    expect(IndexMap.isColumnSnp('4680')).toBe(false);
    expect(IndexMap.isColumnSnp('1')).toBe(false);
    expect(IndexMap.isColumnSnp('01')).toBe(false);
    expect(IndexMap.isColumnSnp('20')).toBe(false);
    expect(IndexMap.isColumnSnp('XX')).toBe(false);
    expect(IndexMap.isColumnSnp('XY')).toBe(false);
    expect(IndexMap.isColumnSnp('21556106')).toBe(false);
    expect(IndexMap.isColumnSnp('16954110')).toBe(false);
  });

  it('should infer if the data is a chromosome', function (done) {
    expect(IndexMap.isColumnChromosome('1')).toBe(true);
    expect(IndexMap.isColumnChromosome('01')).toBe(true);
    expect(IndexMap.isColumnChromosome('20')).toBe(true);
    expect(IndexMap.isColumnChromosome('XX')).toBe(true);
    expect(IndexMap.isColumnChromosome('XY')).toBe(true);

    expect(IndexMap.isColumnChromosome('111')).toBe(false);
    expect(IndexMap.isColumnChromosome('FXXBAR')).toBe(false);
    expect(IndexMap.isColumnChromosome('GG')).toBe(false);
    expect(IndexMap.isColumnChromosome('rs4680')).toBe(false);
    expect(IndexMap.isColumnChromosome('21556106')).toBe(false);
    expect(IndexMap.isColumnChromosome('16954110')).toBe(false);
  });

  it('should infer if the data is a genotype', function (done) {
    expect(IndexMap.isColumnGenotype('GG')).toBe(true);
    expect(IndexMap.isColumnGenotype('CG')).toBe(true);
    expect(IndexMap.isColumnGenotype('AT')).toBe(true);
    expect(IndexMap.isColumnGenotype('TA')).toBe(true);
    expect(IndexMap.isColumnGenotype('TT')).toBe(true);

    expect(IndexMap.isColumnGenotype('G')).toBe(false);
    expect(IndexMap.isColumnGenotype('1')).toBe(false);
    expect(IndexMap.isColumnGenotype('01')).toBe(false);
    expect(IndexMap.isColumnGenotype('20')).toBe(false);
    expect(IndexMap.isColumnGenotype('XX')).toBe(false);
    expect(IndexMap.isColumnGenotype('XY')).toBe(false);
    expect(IndexMap.isColumnGenotype('111')).toBe(false);
    expect(IndexMap.isColumnGenotype('rs4680')).toBe(false);
    expect(IndexMap.isColumnGenotype('21556106')).toBe(false);
    expect(IndexMap.isColumnGenotype('16954110')).toBe(false);
  });

  it('should infer if the data is a nucleotide', function (done) {
    expect(IndexMap.isColumnNucleotide('G')).toBe(true);
    expect(IndexMap.isColumnNucleotide('C')).toBe(true);
    expect(IndexMap.isColumnNucleotide('A')).toBe(true);
    expect(IndexMap.isColumnNucleotide('T')).toBe(true);

    expect(IndexMap.isColumnNucleotide('GG')).toBe(false);
    expect(IndexMap.isColumnNucleotide('1')).toBe(false);
    expect(IndexMap.isColumnNucleotide('01')).toBe(false);
    expect(IndexMap.isColumnNucleotide('20')).toBe(false);
    expect(IndexMap.isColumnNucleotide('XX')).toBe(false);
    expect(IndexMap.isColumnNucleotide('XY')).toBe(false);
    expect(IndexMap.isColumnNucleotide('111')).toBe(false);
    expect(IndexMap.isColumnNucleotide('rs4680')).toBe(false);
    expect(IndexMap.isColumnNucleotide('21556106')).toBe(false);
    expect(IndexMap.isColumnNucleotide('16954110')).toBe(false);
  });

  it('should infer if the data is a position', function (done) {
    expect(IndexMap.isColumnPosition('21556106')).toBe(true);
    expect(IndexMap.isColumnPosition('16954110')).toBe(true);
    expect(IndexMap.isColumnPosition('111')).toBe(true);

    expect(IndexMap.isColumnPosition('CG')).toBe(false);
    expect(IndexMap.isColumnPosition('AT')).toBe(false);
    expect(IndexMap.isColumnPosition('TA')).toBe(false);
    expect(IndexMap.isColumnPosition('TT')).toBe(false);
    expect(IndexMap.isColumnPosition('1')).toBe(false);
    expect(IndexMap.isColumnPosition('01')).toBe(false);
    expect(IndexMap.isColumnPosition('20')).toBe(false);
    expect(IndexMap.isColumnPosition('XX')).toBe(false);
    expect(IndexMap.isColumnPosition('XY')).toBe(false);
    expect(IndexMap.isColumnPosition('rs4680')).toBe(false);
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