import type { Genotype } from "./Genotype"

export interface GeneVariant {
  rsid: string
  chromosome: string
  position: string
  genotype: Genotype | null
  phenotype: string
  pathogenic: Genotype[]
  gene: string | null
}