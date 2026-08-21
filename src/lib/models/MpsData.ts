/**
 * A mapping from rs id to MpsData
 * Regarding {@link onForwardStrand}, see {@link GeneVariant.fromOppositeStrand}
 */
export type MpsDataByRsid = Record<string, {
  phenotype: string
  pathogenic: string[]
  onForwardStrand: boolean | null
  gene: string
}>