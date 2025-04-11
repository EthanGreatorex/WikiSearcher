document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.search-box');
  const input = document.querySelector('input[type="search"]');
  const resultsContainer = document.querySelector('.results');
  const modal = document.getElementById('modal');
  const iframe = document.getElementById('wiki-frame');
  const closeBtn = document.querySelector('.close');

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTerm = input.value;
    if (searchTerm) {
      searchWikipedia(searchTerm);
    }
  });

  function searchWikipedia(searchTerm) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=500&srsearch=${encodeURIComponent(searchTerm)}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        displayResults(data.query.search);
      })
      .catch(error => alert('Error: ' + error));
  }

  function displayResults(results) {
    resultsContainer.innerHTML = '';
    results.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.className = 'result';
      resultElement.innerHTML = `
        <h3>${result.title}</h3>
        <p>${result.snippet}</p>
        <button class="read-more" data-pageid="${result.pageid}">Read More</button>
      `;
      resultsContainer.appendChild(resultElement);
    });


    document.querySelectorAll('.read-more').forEach(button => {
      button.addEventListener('click', function () {
        const pageId = this.getAttribute('data-pageid');
        const wikiUrl =  updateIframeTheme(pageId);
        console.log(wikiUrl)
        iframe.src = wikiUrl;
        modal.style.display = 'block';
      });
    });
  }

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    iframe.src = ''; 
  });


  window.addEventListener('click', event => {
    if (event.target === modal) {
      modal.style.display = 'none';
      iframe.src = '';
    }
  });
});

function updateIframeTheme(pageId) {
  const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  return `https://en.wikipedia.org/?curid=${pageId}&theme=${currentTheme}`;
}


const themeToggle = document.querySelector('.theme-toggle');

function applySystemTheme() {
  if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
}

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
});

applySystemTheme();
