export enum Nucleotide {
  A = "A",
  T = "T",
  C = "C",
  G = "G"
}

export class Genotype {
  alleles: Nucleotide[];

  constructor(alleles: Nucleotide[]) {
    this.alleles = alleles;
  }

  /**
   * Constructs a Genotype from an {@link alleleString}
   * @param alleleString A string representing the combination of alleles in encoded genetic data
   */
  public static fromString(alleleString: string): Genotype | null {
    const alleleStrings = alleleString.split('');
    const firstLetter = alleleString[0];
    const secondLetter = alleleString[1];

    const nucleotideArray = Object.keys(Nucleotide);
    if (alleleStrings.every(s => nucleotideArray.includes(s))) {
      return new Genotype(alleleStrings.map(s => s as Nucleotide));
    } else {
      return null;
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