export type MpsData = Record<string, {
  phenotype: string
  pathogenic: string[]
  onForwardStrand: boolean | null
  gene: string
}>