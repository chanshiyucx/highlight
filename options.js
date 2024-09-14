

document.addEventListener('DOMContentLoaded', () => {
  const newWordInput = document.getElementById('newWord');
  const addWordBtn = document.getElementById('addWordBtn');
  const wordListEl = document.getElementById('wordList')
  const removeSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>`
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

  addWordBtn.addEventListener('click', () => {
    const newWord = newWordInput.value.trim() 
    if (newWord && !words.includes(newWord)) {
      words.push(newWord); 
      addWord(newWord)
      chrome.storage.sync.set({ highlightWords: words })
    }
  });


  chrome.storage.sync.get(["highlightWords"], function (result) {
    words = result.highlightWords ?? []
    renderWordList()
  })

})