const removeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`
const wordListEl = document.getElementById('wordList')
let words = []


function renderWordList() {
  wordListEl.innerHTML = ""
  words.forEach(addWord);
}

function addWord(word) {
  const li = document.createElement('li');
  li.textContent = word;

  const deleteBtn = document.createElement('button');
  deleteBtn.innerHTML = removeSvg
  deleteBtn.addEventListener('click', () => {
    deleteWord(word);
    li.remove()
  });

  li.appendChild(deleteBtn);
  wordListEl.appendChild(li);
}

function deleteWord(word) {
  const index = words.find(w => w === word)
  words.splice(index, 1);  
  chrome.storage.sync.set({ highlightWords: words })
}

function exportToCSV() {
  const csvContent = words.join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'words.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


function importFromCSV(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      words = content.split('\n').map(word => word.trim()).filter(Boolean)
      renderWordList()
      chrome.storage.sync.set({ highlightWords: words })
    }
    reader.readAsText(file);
  }
}


document.getElementById('addWordBtn').addEventListener('click', () => {
  const newWord = document.getElementById('newWord').value.trim() 
  if (newWord && !words.includes(newWord)) {
    words.push(newWord); 
    addWord(newWord)
    chrome.storage.sync.set({ highlightWords: words })
  }
});

document.getElementById('exportBtn').addEventListener('click', exportToCSV)

document.getElementById('importBtn').addEventListener('click', function () {
  document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput').addEventListener('change', importFromCSV)

chrome.storage.sync.get(["highlightWords"], function (result) {
  words = result.highlightWords ?? []
  renderWordList()
})

