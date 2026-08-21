import type { Genotype } from "./Genotype"

interface IGeneVariant {
  rsid: string
  genotype: Genotype | null
  phenotype: string
  pathogenic: Genotype[]
  gene: string | null
  flipStrand?: boolean
}

export class GeneVariant implements IGeneVariant {
  rsid: string
  genotype: Genotype | null
  // Data from matching MPS data, NOT the variant itself.
  phenotype: string
  // Data from matching MPS data, NOT the variant itself.
  pathogenic: Genotype[]
  gene: string | null
  flipStrand: boolean

  constructor(object: IGeneVariant) {
    this.rsid = object.rsid;
    this.genotype = object.genotype;
    this.phenotype = object.phenotype;
    this.pathogenic = object.pathogenic;
    this.gene = object.gene;
    this.flipStrand = object.flipStrand ?? false;
  }

  /**
   * Given the pathogenic alleles that an {@link rsid} can have,
   * returns which allele matches the genotype present on this specific
   * variant from the individual.
   */
  get pathogenicAllele(): Genotype | null {
    return this.pathogenic.find((genotype) =>
      this.normalizedGenotype?.matches(genotype),
    ) ?? null;
  }

  /**
   * Use this for matching. The raw {@link genotype} should be used internally
   * and for setting query parameters and/or exporting.
   */
  get normalizedGenotype(): Genotype | null {
    if (this.flipStrand) {
      return this.genotype?.fromOppositeStrand() ?? null;
    } else {
      return this.genotype;
    }
  }
}