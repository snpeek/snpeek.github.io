import * as Papa from 'papaparse'

interface Elements {
  fileInput: HTMLInputElement
  analyzeBtn: HTMLButtonElement
  resultsDiv: HTMLDivElement
  progressBar: HTMLDivElement
  progressContainer: HTMLDivElement
  saveReportBtn: HTMLButtonElement
  snpsInput?: HTMLInputElement | null
}

type MpsData = Record<string, {
  phenotype: string
  pathogenic: string[]
  gene: string
}>

interface Variant {
  rsid: string
  chromosome: string
  position: string
  genotype: string
  phenotype: string
  pathogenic: string[]
  gene: string | null
}

(window as any).main = main

export function main (): void {
  const elements = getDOMElements()

  elements.analyzeBtn.addEventListener('click', () => {
    if (validateDOMElements(elements)) {
      fetchMpsData().then(snpsToSearch => {
        if (snpsToSearch == null) {
          console.error('Failed to load MPS data.')
          return
        }

        processFile(elements, snpsToSearch)
      }).catch(error => {
        console.error('Error fetching MPS data:', error)
      })
    }
  })
}

async function fetchMpsData (): Promise<MpsData | null> {
  try {
    const response = await fetch('./mps/mps-data.json') // TODO this should be passed in
    const mpsData: MpsData = await response.json()

    if (Object.keys(mpsData).length > 0) {
      return mpsData
    } else {
      console.error('Error: MPS data is empty')
      return null
    }
  } catch (error) {
    console.error('Error fetching MPS data:', error)
    return null
  }
}

function getDOMElements (): Elements {
  const elements: Elements = {
    fileInput: document.getElementById('txt-file') as HTMLInputElement,
    analyzeBtn: document.getElementById('analyze-btn') as HTMLButtonElement,
    resultsDiv: document.getElementById('results') as HTMLDivElement,
    progressBar: document.getElementById('progress-bar') as HTMLDivElement,
    progressContainer: document.getElementById('progress-container') as HTMLDivElement,
    saveReportBtn: document.getElementById('save-report') as HTMLButtonElement
  }

  const snpsInputElement = document.getElementById('snps-input')
  if (snpsInputElement != null) {
    elements.snpsInput = snpsInputElement as HTMLInputElement
  }

  return elements
}

function validateDOMElements (elements: Elements): boolean {
  for (const key in elements) {
    if (elements[key as keyof Elements] === null) {
      console.error(`DOM element ${key} not found.`)
      return false
    }
  }

  // Check if snpsInput is defined and is not null
  if ('snpsInput' in elements && elements.snpsInput === null) {
    console.error('SNPs input selector not found.')
    return false
  }

  return true
}

function processFile (elements: Elements, mpsData: MpsData): void {
  progressBarShow(elements)

  const file = elements.fileInput?.files?.[0]
  if (file == null) {
    alert('Please select a file!')
    return
  }
  console.log(`file size=${file.size}`)
  const maxSize = 1024 * 1024 * 100 // 100 Mb
  if (file.size > maxSize) {
    console.log('Streaming large file=' + file.name)
    if (getFileExtension(file.name) !== 'vcf') {
      alert('Large file is not a vcf file')
      return
    }
    parseFileStream(file, elements, mpsData, parseVCFData, '\t')
  } else {
    parseFile(file, elements, mpsData)
  }
}

function parseFile (file: File, elements: Elements, mpsData: MpsData): void {
  Papa.parse(file, {
    preview: 1, // read just the first line
    complete: function (results) {
      const firstLine: string = results.data.join('')

      const twentyThreeAndMeHeader = 'generated by 23andMe'
      const ancestryHeader = '==> filename.txt <==='
      let parseRowFunction: (data: string[][], mpsData: MpsData) => Variant[]
      let delimiter: string

      if (firstLine.includes(twentyThreeAndMeHeader)) {
        console.log('detected 23andme data')
        parseRowFunction = parse23AndMeData
        delimiter = '\t'
      } else if (firstLine.includes(ancestryHeader)) {
        console.log('detected ancestry data')
        parseRowFunction = parseAncestryData
        delimiter = ','
      } else {
        alert('Unable to determine the filetype from the header.')
        return
      }
      parseFileStream(file, elements, mpsData, parseRowFunction, delimiter)
    },
    error: function (error) {
      console.error('Error while reading file:', error)
      alert('An error occurred while reading the file.')
      progressBarHide(elements)
    }
  }
  )
}

function parseFileStream (
  file: File,
  elements: Elements,
  mpsData: MpsData,
  parseRowFunction: (data: string[][], mpsData: MpsData) => Variant[],
  delimiter: string
): void {
  const chunkSize = 1024 * 50 // 50KB
  let matchingRsids: Variant[] = [] // aggregate all SNPs

  // for updating the progress bar
  const fileSize = file.size
  let processedSize = 0

  Papa.parse(file, {
    chunkSize,
    dynamicTyping: true,
    delimiter,
    chunk: (results, parser) => {
      const data = results.data as string[][]
      processedSize += chunkSize

      const progress = processedSize / fileSize * 100
      progressBarUpdate(elements, `${progress}%`)

      try {
        const foundSnps = parseRowFunction(data, mpsData)
        matchingRsids = matchingRsids.concat(foundSnps)
      } catch (error) {
        console.error('Error while parsing chunk:', error)
        alert('An error occurred while parsing the file.')
        parser.abort()
      }
    },
    complete: () => {
      progressBarUpdate(elements, '100%')
      const matchingVariants = checkVariantGenotypes(mpsData, matchingRsids)
      renderTable(elements, matchingVariants)
      renderReportDownload(elements, matchingVariants)
      progressBarHide(elements)
    },
    error: (error) => {
      console.error('Error while reading file:', error)
      alert('An error occurred while reading the file.')
      progressBarHide(elements)
    }
  })
}

function parseVCFData (data: string[][], mpsData: MpsData): Variant[] {
  const foundSnps: Variant[] = []
  data.forEach(row => {
    if (row.length < 5 || (typeof row[0] === 'string' && row[0].startsWith('#'))) {
      return // skip these rows
    }
    const snp = row[2]
    if (snp in mpsData) {
      foundSnps.push({
        rsid: snp,
        chromosome: row[0],
        position: row[1],
        genotype: row[4], // assuming genotype is in the 5th column
        phenotype: mpsData[snp].phenotype,
        pathogenic: mpsData[snp].pathogenic,
        gene: nullOrEmptyString(mpsData[snp].gene)
      })
    }
  })
  return foundSnps
}

function parseAncestryData (data: string[][], mpsData: MpsData): Variant[] {
  const foundSnps: Variant[] = []
  data.forEach(row => {
    if (row.length < 4) {
      return // skip these rows
    }
    const snp = row[0]
    if (snp in mpsData) {
      foundSnps.push({
        rsid: snp,
        chromosome: row[1],
        position: row[2],
        genotype: row[3],
        phenotype: mpsData[snp].phenotype,
        pathogenic: mpsData[snp].pathogenic,
        gene: nullOrEmptyString(mpsData[snp].gene)
      })
    }
  })
  return foundSnps
}

function parse23AndMeData (data: string[][], mpsData: MpsData): Variant[] {
  const foundSnps: Variant[] = []
  data.forEach(row => {
    // console.log(`row=${row[0]}`)
    if (row.length < 4 || (typeof row[0] === 'string' && row[0].startsWith('#'))) {
      return // skip these rows
    }
    const snp = row[0]
    if (snp in mpsData) {
      foundSnps.push({
        rsid: snp,
        chromosome: row[1],
        position: row[2],
        genotype: row[3],
        phenotype: mpsData[snp].phenotype,
        pathogenic: mpsData[snp].pathogenic,
        gene: nullOrEmptyString(mpsData[snp].gene)
      })
    }
  })
  return foundSnps
}

function getFileExtension (filename: string): string {
  return filename.substring(filename.lastIndexOf('.') + 1)
}

function nullOrEmptyString (str: string | null): string {
  return str !== null ? str : ''
}

// This function tries both orientations to see if they match, it returns the genotype flipped or not if it exists
// TODO this isn't the best solution, it does come with the risk of https://www.snpedia.com/index.php/Ambiguous_flip
function checkVariantGenotypes (mpsData: MpsData, variants: Variant[]): Variant[] {
  const sameGenotypeMatches = variants.filter(variant => mpsData[variant.rsid].pathogenic.includes(variant.genotype))
  const flippedGenotypeMatches = variants
    .map(variant => ({ ...variant, genotype: flipOrientation(variant.genotype) }))
    .filter(variant => mpsData[variant.rsid].pathogenic.includes(variant.genotype))

  return [...sameGenotypeMatches, ...flippedGenotypeMatches]
}

function flipOrientation (genotype: string): string {
  if (genotype.length !== 2) {
    throw new Error('Invalid genotype')
  }
  if (genotype === 'II') {
    return genotype // we don't need to flip II genotypes
  }

  const complementMap: Record<string, string> = {
    A: 'T',
    T: 'A',
    C: 'G',
    G: 'C'
  }

  return genotype
    .split('')
    .reverse()
    .map(allele => {
      if (!(allele in complementMap)) {
        throw new Error(`Invalid allele=${allele} genotype=${genotype}`)
      }
      return complementMap[allele]
    })
    .join('')
}

function prioritySort (variants: Variant[]): Record<string, Variant[]> {
  const priorityOrder = ['DNA Methylation', 'Estrogen Deactivation']

  // Group the found SNPs by phenotype
  const groups: Record<string, Variant[]> = groupBy(variants, 'phenotype')

  const sortWithPriority = (a: string, b: string): number => {
    const indexA = priorityOrder.indexOf(a)
    const indexB = priorityOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  }

  const sortedKeys = Object.keys(groups).sort(sortWithPriority)

  const sortedGroups: Record<string, Variant[]> = {}
  for (const key of sortedKeys) {
    sortedGroups[key] = groups[key]
  }
  return sortedGroups
}

function renderTable (elements: Elements, foundSnps: Variant[]): void {
  if (foundSnps.length === 0) {
    elements.resultsDiv.textContent = 'No matching SNPs found'
    return // Stop the function if no SNPs were found
  }
  // Sort the found SNPs by phenotype
  foundSnps.sort((a, b) => a.phenotype.localeCompare(b.phenotype))

  const sortedGroups = prioritySort(foundSnps)

  // Clear previous results
  elements.resultsDiv.innerHTML = ''

  // Loop through each group and create a table
  for (const phenotype in sortedGroups) {
    // Creating table title
    const title = document.createElement('h3')
    title.textContent = phenotype
    elements.resultsDiv.appendChild(title)

    // Creating table element
    const table = document.createElement('table')
    table.style.width = '100%'
    table.setAttribute('border', '1')

    const headerRow = document.createElement('tr')
    const columns: Array<keyof Variant> = ['rsid', 'genotype', 'pathogenic', 'chromosome', 'position', 'gene']
    const columnDisplay: Record<string, string> = {
      rsid: 'RSID',
      genotype: 'Genotype',
      pathogenic: 'Pathogenic',
      chromosome: 'Chromosome',
      position: 'Position',
      gene: 'Gene'
    }
    columns.forEach(column => {
      const th = document.createElement('th')
      th.textContent = columnDisplay[column]
      headerRow.appendChild(th)
    })

    table.appendChild(headerRow)

    sortedGroups[phenotype].forEach(snp => {
      const tr = document.createElement('tr')
      columns.forEach(column => {
        const td = document.createElement('td')
        const content = escapeHtml(String(snp[column]))
        td.innerHTML = column === 'rsid' ? linkToSnpedia(content) : content
        tr.appendChild(td)
      })
      table.appendChild(tr)
    })

    elements.resultsDiv.appendChild(table)
  }
}

function renderReportDownload (elements: Elements, foundSnps: Variant[]): void {
  const button = document.createElement('button')
  button.textContent = 'Save Report'
  button.onclick = () => { downloadCSV(foundSnps) }

  // Insert the button after the table
  elements.saveReportBtn.innerHTML = ''
  elements.saveReportBtn.appendChild(button)
}

function groupBy (arr: Variant[], key: keyof Variant): Record<string, Variant[]> {
  return arr.reduce((rv: Record<string, Variant[]>, x: Variant) => {
    const keyValue = String(x[key])
    if (!(keyValue in rv)) {
      rv[keyValue] = []
    }
    rv[keyValue].push(x)
    return rv
  }, {})
}

function convertToCSV (arrayOfObjects: any[]): string {
  const keys = Object.keys(arrayOfObjects[0])
  const values = arrayOfObjects.map(obj => keys.map(key => obj[key]).join(','))
  return [keys.join(','), ...values].join('\n')
}

function downloadCSV (obj: any[]): void {
  // Convert the object to CSV
  const csv = convertToCSV(obj)

  // Create a blob from the CSV string
  const blob = new Blob([csv], { type: 'text/csv' })

  // Create a hidden link and attach the blob
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = URL.createObjectURL(blob)
  a.download = 'meyer-powers-report.csv'

  // Append the link to the body
  document.body.appendChild(a)

  // Programmatically click the link
  a.click()

  // Clean up the link
  document.body.removeChild(a)
}

function escapeHtml (unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function linkToSnpedia (snp: string): string {
  return '<a href="https://www.snpedia.com/index.php/' + snp + '">' + snp + '</a>'
}

function progressBarUpdate (elements: Elements, value: string): void {
  elements.progressBar.style.width = value
  // elements.progressBar.innerHTML = value;
}

function progressBarHide (elements: Elements): void {
  elements.progressContainer.style.display = 'none'
}

function progressBarShow (elements: Elements): void {
  elements.progressContainer.style.display = 'block'
  elements.progressBar.style.width = '0%'
}
