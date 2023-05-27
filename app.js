// eslint-disable-next-line no-unused-vars
async function main (snpsInputSelector) {
  const elements = getDOMElements(snpsInputSelector)

  elements.analyzeBtn.addEventListener('click', async () => {
    if (validateDOMElements(elements, snpsInputSelector)) {
      const snpsToSearch = await fetchMpsData()
      if (!snpsToSearch) {
        console.error('Failed to load MPS data.')
        return
      }

      processFile(elements, snpsToSearch)
    }
  })
}

// Fetch mps-data.json and return the keys as snpsToSearch
async function fetchMpsData () {
  try {
    const response = await fetch('mps-data.json')
    const mpsData = await response.json()
    return Object.keys(mpsData)
  } catch (error) {
    console.error('Error fetching MPS data:', error)
    return null
  }
}

function getDOMElements (snpsInputSelector) {
  const elements = {
    fileInput: document.getElementById('txt-file'),
    analyzeBtn: document.getElementById('analyze-btn'),
    resultsDiv: document.getElementById('results'),
    progressBar: document.getElementById('progress-bar'),
    progressContainer: document.getElementById('progress-container')
  }

  if (snpsInputSelector) {
    elements.snpsInput = document.querySelector(snpsInputSelector)
  }

  return elements
}

function validateDOMElements (elements, snpsInputSelector) {
  for (const key in elements) {
    if (elements[key] === null) {
      console.error(`DOM element ${key} not found.`)
      return false
    }
  }

  if (snpsInputSelector && !elements.snpsInput) {
    console.error('SNPs input selector not found.')
    return false
  }

  return true
}

function processFile (elements, searchSnps) {
  console.log('searchSNps=' + searchSnps)
  searchSnps = searchSnps.map(snp => snp.trim()).filter(snp => snp !== '')

  if (!searchSnps || searchSnps.length === 0) {
    alert('Please enter at least one SNP!')
    return
  }

  elements.progressContainer.style.display = 'block'
  elements.progressBar.style.width = '0%'

  const file = elements.fileInput.files[0]
  if (file) {
    readFile(file, elements, searchSnps)
  } else {
    alert('Please select a file!')
  }
}

function readFile (file, elements, searchSnps) {
  const reader = new FileReader()

  reader.onprogress = function (e) {
    if (e.lengthComputable) {
      const progress = Math.floor((e.loaded / e.total) * 100)
      elements.progressBar.style.width = progress + '%'
    }
  }

  reader.onload = function (e) {
    parseFile(e.target.result, elements, searchSnps)
  }

  reader.onerror = function () {
    console.error('Error while reading file:', reader.error)
    alert('An error occurred while reading the file.')
    elements.progressContainer.style.display = 'none'
  }

  reader.readAsText(file)
}

function parseFile (result, elements, searchSnps) {
  // eslint-disable-next-line no-undef
  Papa.parse(result, {
    delimiter: '\t',
    dynamicTyping: true,
    complete: function (results) {
      const foundSnps = analyze23AndMeData(results.data, searchSnps)
      renderTable(elements, foundSnps)
      elements.progressContainer.style.display = 'none'
    },
    error: function (error) {
      console.error('Error while parsing file:', error)
      alert('An error occurred while parsing the file.')
      elements.progressContainer.style.display = 'none'
    }
  })
}

function analyze23AndMeData (data, snpsToSearch) {
  const foundSnps = []
  data.forEach(row => {
    if (!row || row.length < 4 || (typeof row[0] === 'string' && row[0].startsWith('#'))) {
      return
    }
    const snp = row[0]
    if (snpsToSearch.includes(snp)) {
      foundSnps.push({
        rsid: snp,
        chromosome: row[1],
        position: row[2],
        genotype: row[3]
      })
    }
  })
  return foundSnps
}

function renderTable (elements, foundSnps) {
  // Creating table element
  const table = document.createElement('table')
  table.style.width = '100%'
  table.setAttribute('border', '1')

  const headerRow = document.createElement('tr')
  const columns = ['rsid', 'chromosome', 'position', 'genotype']
  columns.forEach(column => {
    const th = document.createElement('th')
    th.textContent = column
    headerRow.appendChild(th)
  })

  table.appendChild(headerRow)

  foundSnps.forEach(snp => {
    const tr = document.createElement('tr')
    columns.forEach(column => {
      const td = document.createElement('td')
      const content = escapeHtml(String(snp[column]))
      td.innerHTML = column === 'rsid' ? linkToSnpedia(content) : content
      tr.appendChild(td)
    })
    table.appendChild(tr)
  })

  elements.resultsDiv.innerHTML = ''
  elements.resultsDiv.appendChild(table)
}

function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function linkToSnpedia (snp) {
  return '<a href="https://www.snpedia.com/index.php/' + snp + '">' + snp + '</a>'
}
