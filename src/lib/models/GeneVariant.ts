import type { Genotype } from "./Genotype"

interface IGeneVariant {
  rsid: string
  chromosome: string
  position: string
  genotype: Genotype | null
  phenotype: string
  pathogenic: Genotype[]
  gene: string | null
}

export class GeneVariant implements IGeneVariant {
  rsid: string
  chromosome: string
  position: string
  genotype: Genotype | null
  // Data from matching MPS data, NOT the variant itself.
  phenotype: string
  // Data from matching MPS data, NOT the variant itself.
  pathogenic: Genotype[]
  gene: string | null

  constructor(object: IGeneVariant) {
    this.rsid = object.rsid;
    this.chromosome = object.chromosome;
    this.position = object.position;
    this.genotype = object.genotype;
    this.phenotype = object.phenotype;
    this.pathogenic = object.pathogenic;
    this.gene = object.gene;
  }

  /**
   * Given the pathogenic alleles that an {@link rsid} can have,
   * returns which allele matches the genotype present on this specific
   * variant from the individual.
   */
  get pathogenicAllele(): Genotype | null {
    return this.pathogenic.find((genotype) =>
      this.genotype?.matches(genotype),
    ) ?? null;
  }
}