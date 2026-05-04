import Papa, { type ParseResult } from "papaparse";
import { GeneVariant } from "./GeneVariant";
import type { MpsDataByRsid } from "./MpsData";
import { Genotype } from "./Genotype";
import { IndexMap } from "$lib/parsing/parsing";

export type GeneDataRowParser = (data: string[][], mpsDict: MpsDataByRsid) => GeneVariant[];

/**
 * An abstraction over the parsing and handling of genetic data.
 */
export class GeneDataParser {
  file: File;
  parseRow: GeneDataRowParser;
  delimiter: string;
  mpsData: MpsDataByRsid;

  constructor(file: File, parseRow: GeneDataRowParser, delimiter: string, mpsData: MpsDataByRsid) {
    this.file = file;
    this.parseRow = parseRow;
    this.delimiter = delimiter;
    this.mpsData = mpsData
  }

  /**
   * Decides which parser to use based on the different formats {@link file} can have.
   * Therefore, this is probably what you want to use to construct a {@link GeneDataParser}, 
   * rather than the constructor.
   * @param file The gene data file. Usually a CSV
   * @param mpsData The MPS Data file. Usually a JSON. Should be statically served under ./mps
   * @returns A new {@link GeneDataParser}
   */
  static async fromFile(file: File, mpsData: MpsDataByRsid): Promise<GeneDataParser> {
    const maxSize = 1024 * 1024 * 100 // 100 Mb
    const fileExtension = file.name.split('.').at(-1);
    if (file.size > maxSize) {
      console.debug('Streaming large file=' + file.name)
      if (fileExtension !== 'vcf') {
        // TODO: Error message
        throw Error("Large file is not a vcf file")
      }
      return new GeneDataParser(file, GeneDataParser.parseVCFData, '\t', mpsData);
    } else {
      const delimiter = await this.guessCsvDelimiter(file);
      const sampleRow = await this.getSampleRow(file, delimiter, 100);
      const rowIndexMap = IndexMap.fromSampleRow(sampleRow);
      // We have to rebind rowIndexMap as the "this" of rowIndexMap.parser
      // because of javascript quirks.
      return new GeneDataParser(
        file,
        rowIndexMap.parser.bind(rowIndexMap),
        delimiter,
        mpsData
      );
    }
  }

  /**
   * Given the {@link parseRow} that was set during construction, parses the {@link file}
   * to return an array of {@link GeneVariant}s.
   * @param onUpdateProgress A function that allows the call-site (i.e. likely a svelte component) 
   * to render a progress bar as the {@link file} is parsed.
   * @returns A Promise that returns an array of {@link GeneVariant}.
   */
  async parse(onUpdateProgress: (progress: number) => void): Promise<GeneVariant[]> {
    const chunkSize = 1024 * 50 // 50KB
    let matchingRsids: GeneVariant[] = [] // aggregate all SNPs

    // for updating the progress bar
    const fileSize = this.file.size
    let processedSize = 0

    return new Promise((resolve, reject) => {
      Papa.parse(this.file, {
        chunkSize,
        comments: "#",
        skipEmptyLines: "greedy",
        // Papaparse can automatically detect delimiter but it's imperfect.
        // See this.guessCsvDelimiter
        delimiter: this.delimiter,
        chunk: (results, parser) => {
          const data = results.data as string[][]
          processedSize += chunkSize

          const progress = processedSize / fileSize * 100
          onUpdateProgress(progress);

          try {
            const foundSnps = this.parseRow(data, this.mpsData)
            matchingRsids = matchingRsids.concat(foundSnps)
          } catch (error) {
            // TODO: Error message
            console.error('Error while parsing chunk:', error)
            alert('An error occurred while parsing the file.')
            parser.abort()
          }
        },
        complete(results, file) {
          resolve(matchingRsids);
        },
        error(error, file) {
          reject(error);
        },
      })
    });
  }

  /**
   * @deprecated See IndexMap
   */
  private static parse23AndMeData(data: string[][], mpsData: MpsDataByRsid): GeneVariant[] {
    const foundSnps: GeneVariant[] = []
    data.forEach(row => {
      // console.log(`row=${row[0]}`)
      if (row.length < 4 || (typeof row[0] === 'string' && row[0].startsWith('#'))) {
        return // skip these rows
      }
      const snp = row[0]
      if (snp in mpsData) {
        const onForward = mpsData[snp].onForwardStrand ?? true;
        let genotype = Genotype.fromString(row[3]);
        if (!onForward) {
          genotype = genotype?.fromOppositeStrand() ?? null;
        }
        const foundSnp = new GeneVariant({
          gene: mpsData[snp].gene,
          rsid: snp,
          chromosome: row[1],
          position: row[2],
          genotype: genotype,
          phenotype: mpsData[snp].phenotype,
          pathogenic: mpsData[snp].pathogenic.map(Genotype.fromString).filter(item => item !== null),
        });
        foundSnps.push(foundSnp);
      }
    })
    return foundSnps
  }

  /**
   * @deprecated See IndexMap
   */
  private static parseAncestryData(data: string[][], mpsData: MpsDataByRsid): GeneVariant[] {
    const foundSnps: GeneVariant[] = []
    data.forEach(row => {
      row = row[0]?.split('\t') ?? [] // HACK: This is a workaround for Papa misreading AncestryDNA files.
      if (row.length < 4) {
        return // skip these rows
      }
      const snp = row[0]
      if (snp in mpsData) {
        const onForward = mpsData[snp].onForwardStrand ?? true;
        let genotype = Genotype.fromString(row[3] + row[4]);
        if (!onForward) {
          genotype = genotype?.fromOppositeStrand() ?? null;
        }
        const foundSnp = new GeneVariant({
          gene: mpsData[snp].gene,
          rsid: snp,
          chromosome: row[1],
          position: row[2],
          genotype: genotype,
          phenotype: mpsData[snp].phenotype,
          pathogenic: mpsData[snp].pathogenic.map(Genotype.fromString).filter(item => item !== null),
        });
        foundSnps.push(foundSnp);
      }
    })
    return foundSnps
  }

  private static parseVCFData(data: string[][], mpsData: MpsDataByRsid): GeneVariant[] {
    const foundSnps: GeneVariant[] = []
    data.forEach(row => {
      if (row.length < 10 || (typeof row[0] === 'string' && row[0].startsWith('#'))) {
        return // skip these rows
      }
      const snp = row[2]
      if (snp in mpsData) {
        const ref = row[3]; // Reference allele
        const alt = row[4]; // Alternate allele(s)
        const genotype = GeneDataParser.parseVCFGenotype(row[9], ref, alt.split(','));
        foundSnps.push(new GeneVariant({
          gene: mpsData[snp].gene,
          rsid: snp,
          chromosome: row[0],
          position: row[1],
          genotype: genotype,
          phenotype: mpsData[snp].phenotype,
          pathogenic: mpsData[snp].pathogenic.map(Genotype.fromString).filter(item => item !== null),
        }))
      }
    })
    return foundSnps
  }

  private static parseVCFGenotype(genotypeField: string, ref: string, alts: string[]): Genotype | null {
    const [genotype] = genotypeField.split(':'); // Extract genotype from the field
    const alleles = genotype.split(/[|/]/); // Split by '|' or '/'
    const alleleString = alleles.map(allele => {
      const index = parseInt(allele, 10);
      return index === 0 ? ref : alts[index - 1] || '.';
    }).join('');
    return Genotype.fromString(alleleString);
  }

  /**
   * Because Papaparse's delimiter guessing is hamstrung by implementation details
   * of the preview feature, we have to write our own.
   * 
   * Delimiter guessing is performed by running a preview parsing for each delimiter to test.
   * The number of columns per row are then compared. The delimiter that yields the largest 
   * number of columns is likely the correct delimiter.
   * See: https://github.com/mholt/PapaParse/blob/cc8c801f83fa2bdbf4baab5048e79b0911d9aa58/papaparse.js#L1340
   * 
   * The problem is that preview seems to be taken before the skipping of empty lines and
   * comments. This, coupled with the preview hardcoded to 10, means that any file containing
   * a header spanning more than 10 lines is going to yield no data for delimiter guessing.
   * @param file The CSV file to be worked on
   */
  static async guessCsvDelimiter(file: File): Promise<string> {
    const delimitersToTest = [",", "\t", "|"];

    // A safer number of lines to preview. May need to be changed as we discover even larger headers.
    const previewLength = 100;
    let bestDelimiter = delimitersToTest[0];
    let bestDelimiterFieldLength = 0;
    for (let index = 0; index < delimitersToTest.length; index++) {
      const delimiterToTest = delimitersToTest[index];
      const result = await this.papaparsePromise<string[]>(file, previewLength, delimiterToTest);
      const totalLength = result.data.map((row) => {
        return row.length;
      }).reduce((prev, curr) => prev + curr);
      const avgLength = totalLength / result.data.length;
      if (avgLength > bestDelimiterFieldLength) {
        bestDelimiter = delimiterToTest;
        bestDelimiterFieldLength = avgLength;
      }
    }
    return bestDelimiter;
  }

  /**
   * Get a sample row from a file to be used for inferring IndexMap.
   */
  static async getSampleRow(file: File, delimiter: string, preview: number): Promise<string[]> {
    const result = await this.papaparsePromise<string[]>(file, preview, delimiter);
    const data = result.data;
    return data[data.length - 1];
  }

  /**
   * Convenience method to avoid callback hell with papaparse
   */
  static papaparsePromise<T>(file: File, preview: number, delimiter: string): Promise<ParseResult<T>> {
    return new Promise((resolve, reject) => {
      Papa.parse<T>(file, {
        preview: preview,
        skipEmptyLines: "greedy",
        comments: "#",
        delimiter: delimiter,
        complete: function (results) {
          resolve(results);
        },
        error: function (reason) {
          reject(reason);
        }
      });
    });
  }
}

