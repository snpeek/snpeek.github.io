const fileInput = document.getElementById('txt-file');
const snpsInput = document.getElementById('snps-input');
const analyzeBtn = document.getElementById('analyze-btn');
const resultsDiv = document.getElementById('results');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');


analyzeBtn.addEventListener('click', () => {
  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file!');
    return;
  }

  const snpsToSearch = snpsInput.value.split(',').map(snp => snp.trim());

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
        analyze23AndMeData(results.data, snpsToSearch);
        progressContainer.style.display = 'none';
      }
    });
  };

  reader.readAsText(file);
});

function analyze23AndMeData(data, snpsToSearch) {
  const foundSnps = {};

  data.forEach(row => {
    if (!row || row.length < 2 || (typeof row[0] === 'string' && row[0].startsWith('#'))) {
      return; // skip if row is null, undefined, doesn't have enough columns or is a comment
    }
    const snp = row[0];  // Assuming the SNP ID is in the 1st column for a 23andMe file.
    if (snpsToSearch.includes(snp)) {
      foundSnps[snp] = true;
    }
  });

  resultsDiv.innerHTML = 'Found SNPs:<br>';
  for (const snp in foundSnps) {
    resultsDiv.innerHTML += snp + '<br>';
  }
}