function setupSNPAnalyzer(snpsInputSelector, snpsToSearch = null) {
  const fileInput = document.getElementById('txt-file');
  const snpsInput = document.querySelector(snpsInputSelector);
  const analyzeBtn = document.getElementById('analyze-btn');
  const resultsDiv = document.getElementById('results');
  const progressBar = document.getElementById('progress-bar');
  const progressContainer = document.getElementById('progress-container');

  // Check if DOM elements exist
  if (!fileInput || !analyzeBtn || !resultsDiv || !progressBar || !progressContainer) {
    console.error('Required DOM elements are missing.');
    return;
  }

  analyzeBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (!file) {
      alert('Please select a file!');
      return;
    }

    if (file.name.split('.').pop() !== 'txt') {
      alert('Please upload a .txt file!');
      return;
    }

    let searchSnps = snpsToSearch;
    if (!searchSnps && snpsInput && snpsInput.value) {
      searchSnps = snpsInput.value.split(',').map(snp => snp.trim());
      searchSnps = searchSnps.filter(snp => snp !== '');
    }

    // check searchSnps instead of snpsToSearch
    if (!searchSnps || searchSnps.length === 0) {
      alert('Please enter at least one SNP!');
      return;
    }

    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    const reader = new FileReader();

    reader.onprogress = function(e) {
      if(e.lengthComputable) {
        const progress = Math.floor((e.loaded / e.total) * 100);
        progressBar.style.width = progress + '%';
      }
    };

    reader.onload = function(e) {
      Papa.parse(e.target.result, {
        delimiter: '\t',
        dynamicTyping: true,
        complete: function(results) {
          analyze23AndMeData(results.data, searchSnps);
          progressContainer.style.display = 'none';
        },
        error: function(error) {
          console.error("Error while parsing file:", error);
          alert("An error occurred while parsing the file.");
          progressContainer.style.display = 'none';
        }
      });
    };

    reader.onerror = function() {
      console.error("Error while reading file:", reader.error);
      alert("An error occurred while reading the file.");
      progressContainer.style.display = 'none';
    };

    reader.readAsText(file);
  });

  function analyze23AndMeData(data, snpsToSearch) {
    const foundSnps = [];
    data.forEach(row => {
      if (!row || row.length < 4 || (typeof row[0] === 'string' && row[0].startsWith('#'))) {
        return;
      }
      const snp = row[0];
      if (snpsToSearch.includes(snp)) {
        foundSnps.push({
          rsid: snp,
          chromosome: row[1],
          position: row[2],
          genotype: row[3]
        });
      }
    });

    // Creating table element
    const table = document.createElement('table');
    table.style.width = '100%';
    table.setAttribute('border', '1');

    const headerRow = document.createElement('tr');
    const columns = ['rsid', 'chromosome', 'position', 'genotype'];
    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column;
      headerRow.appendChild(th);
    });

    table.appendChild(headerRow);

    foundSnps.forEach(snp => {
      const tr = document.createElement('tr');
      columns.forEach(column => {
        const td = document.createElement('td');
        td.textContent = escapeHtml(String(snp[column]));
        tr.appendChild(td);
      });
      table.appendChild(tr);
    });

    resultsDiv.innerHTML = '';
    resultsDiv.appendChild(table);
  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
