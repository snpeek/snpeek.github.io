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

async function fetchMpsData () {
  try {
    const response = await fetch('mps-data.json')
    const mpsData = await response.json()
    return mpsData
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

function processFile (elements, mpsData) {
  elements.progressContainer.style.display = 'block'
  elements.progressBar.style.width = '0%'

  const file = elements.fileInput.files[0]
  if (file) {
    readFile(file, elements, mpsData)
  } else {
    alert('Please select a file!')
  }
}

function readFile (file, elements, mpsData) {
  const reader = new FileReader()

  reader.onprogress = function (e) {
    if (e.lengthComputable) {
      const progress = Math.floor((e.loaded / e.total) * 100)
      elements.progressBar.style.width = progress + '%'
    }
  }

  reader.onload = function (e) {
    parseFile(e.target.result, elements, mpsData)
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

function analyze23AndMeData (data, mpsData) {
  const foundSnps = []
  data.forEach(row => {
    if (!row || row.length < 4 || (typeof row[0] === 'string' && row[0].startsWith('#'))) {
      return // skip these rows
    }
    const snp = row[0]
    if (mpsData[snp]) {
      foundSnps.push({
        rsid: snp,
        chromosome: row[1],
        position: row[2],
        genotype: row[3],
        type: mpsData[snp].type,
        bad: mpsData[snp].bad,
        description: mpsData[snp].description !== null ? mpsData[snp].description : ''
      })
    }
  })
  return foundSnps
}

function renderTable (elements, foundSnps) {
  // Sort the found SNPs by type
  foundSnps.sort((a, b) => a.type.localeCompare(b.type))

  // Group the found SNPs by type
  const groups = groupBy(foundSnps, 'type')

  // Clear previous results
  elements.resultsDiv.innerHTML = ''

  // Loop through each group and create a table
  for (const type in groups) {
    // Creating table title
    const title = document.createElement('h3')
    title.textContent = type
    elements.resultsDiv.appendChild(title)

    // Creating table element
    const table = document.createElement('table')
    table.style.width = '100%'
    table.setAttribute('border', '1')

    const headerRow = document.createElement('tr')
    const columns = ['rsid', 'genotype', 'bad', 'chromosome', 'position', 'description']
    columns.forEach(column => {
      const th = document.createElement('th')
      th.textContent = column
      headerRow.appendChild(th)
    })

    table.appendChild(headerRow)

    groups[type].forEach(snp => {
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

// Group by function
function groupBy (arr, key) {
  return arr.reduce(function (rv, x) {
    (rv[x[key]] = rv[x[key]] || []).push(x)
    return rv
  }, {})
};

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
