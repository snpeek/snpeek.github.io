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
   * Returns a new genotype as if this genotype were read from the opposite strand.
   * This is needed when parsing AncestryDNA and 23andMe files, which report all SNPs in plus/forward
   * orientation, whereas SNPedia reports individual SNPs as either plus/forward or minus/reverse, 
   * depending on the reference standard. For details, see: https://www.snpedia.com/index.php/Orientation
   */
  fromOppositeStrand(): Genotype {
    const swappedAlleles = this.alleles.map((allele) => {
      switch (allele) {
        case Nucleotide.A: {
          return Nucleotide.T;
        }
        case Nucleotide.T: {
          return Nucleotide.A;
        }
        case Nucleotide.C: {
          return Nucleotide.G;
        }
        case Nucleotide.G: {
          return Nucleotide.C;
        }
      }
    });
    return new Genotype(swappedAlleles);
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