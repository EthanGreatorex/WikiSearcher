document.addEventListener('DOMContentLoaded', function () {
  const form = document.querySelector('.search-box');
  const input = document.querySelector('input[type="search"]');
  const resultsContainer = document.querySelector('.results');
  const modal = document.getElementById('modal');
  const aiResponseContainer = document.querySelector('.ai-response');
  const iframe = document.getElementById('wiki-frame');
  const closeBtn = document.querySelector('.close');

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('close-ai')) {
      aiResponseContainer.innerHTML = '';
      aiResponseContainer.style.display = 'none';
    }
  });


  // Wikipedia search functionality
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
      .then(data => displayResults(data.query.search))
      .catch(error => alert('Error: ' + error));
  }

  function displayResults(results) {
    resultsContainer.innerHTML = '';
    results.forEach(result => {
      const resultElement = document.createElement('div');
      resultElement.className = 'result';
      resultElement.innerHTML = `
        <h3 data-term="${result.title}">${result.title}</h3>
        <p>${result.snippet}</p>
        <button class="read-more" data-pageid="${result.pageid}">Read More</button>
        <button class="rainbow-button">Summarise</button>
      `;
      resultsContainer.appendChild(resultElement);
    });

    document.querySelectorAll('.read-more').forEach(button => {
      button.addEventListener('click', function () {
        const pageId = this.getAttribute('data-pageid');
        console.log('Page ID:', pageId);
        iframe.src = updateIframeTheme(pageId);
        modal.style.display = 'block';
      });
    });

    document.querySelectorAll('.rainbow-button').forEach(button => {
      button.addEventListener('click', function () {
        const articleTitle = this.parentElement.querySelector('h3').textContent;
    
        const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(articleTitle)}`;
        console.log("Wiki URL being passed to AI:", wikiUrl); // Debugging
    
        contactAI(wikiUrl);
      });
    });
    

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
  }

  function updateIframeTheme(pageId) {
    const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    return `https://en.wikipedia.org/?curid=${pageId}&theme=${currentTheme}`;
  }

  // Theme toggle functionality
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

  // Contact AI function
  const KEY = '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';

  async function contactAI(wikiUrl) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KEY}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant for summarising Wikipedia articles. Only provide the summary and do not ask follow-up questions. Provide a lengthy response with the use of bullet points.'
            },
            {
              role: 'user',
              content: wikiUrl
            }
          ],
          model: 'llama3-8b-8192',
          temperature: 1,
          max_tokens: 1024,
          top_p: 1,
          stream: false,
          stop: null
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices[0]) {
          displayAiResponse(data.choices[0].message.content);
        } else {
          console.error('Unexpected AI response:', data);
        }
      } else {
        console.error('Failed AI request:', await response.json());
      }
    } catch (error) {
      console.error('Error contacting AI:', error);
    }
  }

  function formatAiResponse(response) {
    return response
      .replace(/\n/g, '<br>')
      .replace(/(^|\<br\>)[-\*]\s(.*?)(?=\<br\>|$)/g, (match, p1, p2) => `${p1}<ul><li>${p2}</li></ul>`)
      .replace(/<\/ul><br><ul>/g, '')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }


  function displayAiResponse(response) {
    aiResponseContainer.innerHTML = '';

    const h3 = document.createElement('h3');
    h3.textContent = '✨AI Summary✨';

    const span = document.createElement('span');
    span.innerHTML = '<span class="close-ai">&times;</span>';

    aiResponseContainer.appendChild(h3);
    aiResponseContainer.appendChild(span);

    const formattedResponse = formatAiResponse(response);

    aiResponseContainer.innerHTML += formattedResponse; 
    aiResponseContainer.style.display = 'block';
  }
});
