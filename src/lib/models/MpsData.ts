/**
 * A mapping from rs id to MpsData
 */
export type MpsDataByRsid = Record<string, {
  phenotype: string
  pathogenic: string[]
  onForwardStrand: boolean | null
  gene: string
}>