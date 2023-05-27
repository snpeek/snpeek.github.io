
// entrypoint
// eslint-disable-next-line no-unused-vars
function handleInputs (snpsInputSelector, snpsToSearch = null) {
  const elements = getDOMElements(snpsInputSelector)

  if (validateDOMElements(elements, snpsInputSelector)) {
    elements.analyzeBtn.addEventListener('click', () => {
      const snpsInput = snpsToSearch !== null ? snpsToSearch : elements.snpsInput.value.split(',')
      processFile(elements.fileInput, snpsInput, elements.progressBar, elements.progressContainer, elements.resultsDiv)
    })
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

function processFile (fileInput, searchSnps, progressBar, progressContainer, resultsDiv) {
  console.log('searchSNps=' + searchSnps)
  searchSnps = searchSnps.map(snp => snp.trim()).filter(snp => snp !== '')

  if (!searchSnps || searchSnps.length === 0) {
    alert('Please enter at least one SNP!')
    return
  }

  progressContainer.style.display = 'block'
  progressBar.style.width = '0%'

  const file = fileInput.files[0]
  if (file) {
    readFile(file, progressBar, progressContainer, resultsDiv, searchSnps)
  } else {
    alert('Please select a file!')
  }
}

function readFile (file, progressBar, progressContainer, resultsDiv, searchSnps) {
  const reader = new FileReader()

  reader.onprogress = function (e) {
    if (e.lengthComputable) {
      const progress = Math.floor((e.loaded / e.total) * 100)
      progressBar.style.width = progress + '%'
    }
  }

  reader.onload = function (e) {
    parseFile(e.target.result, progressBar, progressContainer, resultsDiv, searchSnps)
  }

  reader.onerror = function () {
    console.error('Error while reading file:', reader.error)
    alert('An error occurred while reading the file.')
    progressContainer.style.display = 'none'
  }

  reader.readAsText(file)
}

function parseFile (result, progressBar, progressContainer, resultsDiv, searchSnps) {
  // eslint-disable-next-line no-undef
  Papa.parse(result, {
    delimiter: '\t',
    dynamicTyping: true,
    complete: function (results) {
      analyze23AndMeData(results.data, searchSnps, resultsDiv)
      progressContainer.style.display = 'none'
    },
    error: function (error) {
      console.error('Error while parsing file:', error)
      alert('An error occurred while parsing the file.')
      progressContainer.style.display = 'none'
    }
  })
}

function analyze23AndMeData (data, snpsToSearch, resultsDiv) {
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
      td.textContent = escapeHtml(String(snp[column]))
      tr.appendChild(td)
    })
    table.appendChild(tr)
  })

  resultsDiv.innerHTML = ''
  resultsDiv.appendChild(table)
}

function escapeHtml (unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
