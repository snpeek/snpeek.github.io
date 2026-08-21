import { GeneVariant } from "$lib/models/GeneVariant";
import { Genotype } from "$lib/models/Genotype";
import type { MpsDataByRsid } from "$lib/models/MpsData";

const nucleotidePattern = '(A|C|T|G)';

export interface Variant {
  rsid: string
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
  genotypeIndex?: number;
  nucleotide1Index?: number;
  nucleotide2Index?: number;
}

/**
 * See {@link IIndexMap}
 */
export class IndexMap implements IIndexMap {
  rsidIndex: number;
  // -1 if not found
  genotypeIndex: number;
  // -1 if not found
  nucleotide1Index: number;
  // -1 if not found
  nucleotide2Index: number;

  constructor(object: IIndexMap) {
    this.rsidIndex = object.rsidIndex;
    this.genotypeIndex = object.genotypeIndex ?? -1;
    this.nucleotide1Index = object.nucleotide1Index ?? -1;
    this.nucleotide2Index = object.nucleotide2Index ?? -1;
  }

  static fromSampleRow(sampleRow: string[]): IndexMap {
    // Iterate through the firstRow to find the indices 
    const rsidIndex = sampleRow.findIndex(IndexMap.isColumnSnp);
    const genotypeIndex = sampleRow.findIndex(IndexMap.isColumnGenotype);
    let nucleotide1Index: number = -1;
    let nucleotide2Index: number = -1;
    if (genotypeIndex < 0) {
      nucleotide1Index = sampleRow.findIndex(IndexMap.isColumnNucleotide);
      nucleotide2Index = sampleRow.findLastIndex(IndexMap.isColumnNucleotide);
    }
    if (rsidIndex < 0) {
      throw `Could not find index for rsid: ${rsidIndex}`;
    }
    return new IndexMap({
      rsidIndex: rsidIndex,
      genotypeIndex: genotypeIndex,
      nucleotide1Index: nucleotide1Index,
      nucleotide2Index: nucleotide2Index,
    });
  }

  #accessRsid(row: string[]): string {
    return row[this.rsidIndex];
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
      if (Object.hasOwn(mpsDict, snp)) {
        const mpsData = mpsDict[snp];
        const onForward = mpsData.onForwardStrand ?? true;

        const foundSnp = new GeneVariant({
          gene: mpsData.gene,
          rsid: snp,
          genotype: Genotype.fromString(this.#accessGenotype(row)),
          phenotype: mpsData.phenotype,
          pathogenic: mpsData.pathogenic.map(Genotype.fromString).filter(item => item !== null),
          flipStrand: !onForward
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
    return data.startsWith('rs') || data.startsWith('ilmnseq') || data.startsWith('dupseq');
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