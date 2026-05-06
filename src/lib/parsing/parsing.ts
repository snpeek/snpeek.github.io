import { GeneVariant } from "$lib/models/GeneVariant";
import { Genotype } from "$lib/models/Genotype";
import type { MpsDataByRsid } from "$lib/models/MpsData";

const nucleotidePattern = '(A|C|T|G)';

export interface Variant {
  rsid: string
  chromosome: string
  position: string
  genotype: string
  phenotype: string
  pathogenic: string[]
  gene: string | null
}

/**
 * A mapping from the row-accessible data, to the index of that data within the row.
 */
interface IIndexMap {
  rsidIndex: number;
  chromosomeIndex: number;
  positionIndex: number;
  genotypeIndex: number;
  nucleotide1Index: number;
  nucleotide2Index: number;
}

/**
 * See {@link IIndexMap}
 */
export class IndexMap implements IIndexMap {
  rsidIndex: number;
  chromosomeIndex: number;
  positionIndex: number;
  // -1 if not found
  genotypeIndex: number;
  // -1 if not found
  nucleotide1Index: number;
  // -1 if not found
  nucleotide2Index: number;

  constructor(object: IIndexMap) {
    this.rsidIndex = object.rsidIndex;
    this.chromosomeIndex = object.chromosomeIndex;
    this.positionIndex = object.positionIndex;
    this.genotypeIndex = object.genotypeIndex;
    this.nucleotide1Index = object.nucleotide1Index;
    this.nucleotide2Index = object.nucleotide2Index;
  }

  static fromSampleRow(sampleRow: string[]): IndexMap {
    // Iterate through the firstRow to find the indices 
    const rsidIndex = sampleRow.findIndex(IndexMap.isColumnSnp);
    const chromosomeIndex = sampleRow.findIndex(IndexMap.isColumnChromosome);
    const positionIndex = sampleRow.findIndex(IndexMap.isColumnPosition);
    const genotypeIndex = sampleRow.findIndex(IndexMap.isColumnGenotype);
    let nucleotide1Index: number = -1;
    let nucleotide2Index: number = -1;
    if (genotypeIndex < 0) {
      nucleotide1Index = sampleRow.findIndex(IndexMap.isColumnNucleotide);
      nucleotide2Index = sampleRow.findLastIndex(IndexMap.isColumnNucleotide);
    }
    if (rsidIndex < 0 || chromosomeIndex < 0 || positionIndex < 0) {
      throw `Could not find indices for required fields: ${rsidIndex} ${chromosomeIndex} ${positionIndex}`;
    }
    return new IndexMap({
      rsidIndex: rsidIndex,
      chromosomeIndex: chromosomeIndex,
      positionIndex: positionIndex,
      genotypeIndex: genotypeIndex,
      nucleotide1Index: nucleotide1Index,
      nucleotide2Index: nucleotide2Index,
    });
  }

  #accessRsid(row: string[]): string {
    return row[this.rsidIndex];
  }

  #accessChromosome(row: string[]): string {
    return row[this.chromosomeIndex];
  }

  #accessPosition(row: string[]): string {
    return row[this.positionIndex];
  }

  #accessGenotype(row: string[]): string {
    if (this.genotypeIndex >= 0) {
      return row[this.genotypeIndex];
    }
    if (this.nucleotide1Index < 0 || this.nucleotide2Index < 0) {
      throw 'Unexpectedly missing data for genotype';
    }
    const nucleotide1 = row[this.nucleotide1Index];
    const nucleotide2 = row[this.nucleotide2Index];
    return `${nucleotide1}${nucleotide2}`;
  }

  parser(data: string[][], mpsDict: MpsDataByRsid): GeneVariant[] {
    // We expect data to be clean of any comments and blank lines
    const foundSnps: GeneVariant[] = []
    data.forEach(row => {
      const snp = this.#accessRsid(row);
      const hasNumberRegex = new RegExp("\\d");
      if (!hasNumberRegex.test(row.join(""))) {
        // If there's no number in this row, it's probably a header row
        return;
      }
      if (snp in mpsDict) {
        const mpsData = mpsDict[snp];
        const onForward = mpsData.onForwardStrand ?? true;
        let genotype = Genotype.fromString(this.#accessGenotype(row));
        if (!onForward) {
          genotype = genotype?.fromOppositeStrand() ?? null;
        }
        const foundSnp = new GeneVariant({
          gene: mpsData.gene,
          rsid: snp,
          chromosome: this.#accessChromosome(row),
          position: this.#accessPosition(row),
          genotype: genotype,
          phenotype: mpsData.phenotype,
          pathogenic: mpsData.pathogenic.map(Genotype.fromString).filter(item => item !== null),
        });
        foundSnps.push(foundSnp);
      }
    })
    return foundSnps
  }

  /**
 * Whether or not the column to which this cell belongs is likely an SNP column.
 * @param data the data of the sample row
 * @returns whether the column is likely to be an SNP
 */
  static isColumnSnp(data: string): boolean {
    return data.startsWith('rs') || data.startsWith('ilmnseq');
  }

  static isColumnChromosome(data: string): boolean {
    // 1-2 digit number or XX or XY
    const chromosomeRegex = new RegExp('^([0-2]?[0-9]|XX|XY)$');
    return chromosomeRegex.test(data);
  }

  static isColumnGenotype(data: string): boolean {
    const genotypeRegex = new RegExp(`^${nucleotidePattern}${nucleotidePattern}$`);
    return genotypeRegex.test(data);
  }

  static isColumnNucleotide(data: string): boolean {
    const nucleotideRegex = new RegExp(`^${nucleotidePattern}$`);
    return nucleotideRegex.test(data);
  }

  static isColumnPosition(data: string): boolean {
    // Just guessing here
    const positionRegex = new RegExp('^\\d\\d\\d+$');
    return positionRegex.test(data);
  }
}