export enum Nucleotide {
  A = "A",
  T = "T",
  C = "C",
  G = "G"
}

/**
 * A representation of the combination of Nucleotides. 
 * Interchangeagble with Alleles (I think).
 * An abstraction that allows us to not worry about 
 * the order of "CT" and "TC", etc...
 */
export class Genotype {
  alleles: Nucleotide[];

  constructor(alleles: Nucleotide[]) {
    this.alleles = alleles;
  }

  /**
   * Constructs a Genotype from an {@link alleleString}. 
   * Returns null if invalid nucleotides in alleleString.
   * @param alleleString A string representing the combination of alleles in encoded genetic data
   */
  public static fromString(alleleString: string): Genotype | null {
    const alleleStrings = alleleString.split('');

    const nucleotideArray = Object.keys(Nucleotide);
    if (alleleStrings.every(s => nucleotideArray.includes(s))) {
      return new Genotype(alleleStrings.map(s => s as Nucleotide));
    } else {
      return null;
    }
  }

  /**
   * Constructs a paired Genotype from an existing one, as if it were read from the opposite strand.
   * This is needed when parsing AncestryDNA and 23andMe files, which report all SNPs in plus/forward
   * orientation, whereas SNPedia reports individual SNPs as either plus/forward or minus/reverse, 
   * depending on the reference standard. For details, see: https://www.snpedia.com/index.php/Orientation
   */
  public static fromOppositeStrandTo(original: Genotype | null) : Genotype | null {
    if (original === null) {
      return null;
    }
    else {
      let pairedAlleles : Nucleotide[] = [];
      original.alleles.forEach(n => {
        switch (n) {
          case Nucleotide.A: {
            pairedAlleles.push(Nucleotide.T);
            break;
          }
          case Nucleotide.T: {
            pairedAlleles.push(Nucleotide.A);
            break;
          }
          case Nucleotide.C: {
            pairedAlleles.push(Nucleotide.G);
            break;
          }
          case Nucleotide.G: {
            pairedAlleles.push(Nucleotide.C);
            break;
          }
          default:
            return null;
        }
      });
      return new Genotype(pairedAlleles);
    }
  }

  /**
   * Returns true if every allele on this {@link Genotype} 
   * @param other The other {@link Genotype}
   */
  matches(other: Genotype): boolean {
    // Normally this is a bad idea, but this is one of the few cases
    // where a data structure makes sense to compare string representations.
    return this.toString() === other.toString();
  }

  /**
   * Stable because alleles are sorted.
   */
  toString(): string {
    const sortedAlleles = this.alleles.toSorted();
    return sortedAlleles.join("");
  }
}