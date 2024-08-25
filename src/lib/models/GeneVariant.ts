export interface GeneVariant {
  rsid: string
  chromosome: string
  position: string
  genotype: string
  phenotype: string
  pathogenic: string[]
  gene: string | null
}