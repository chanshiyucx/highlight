// 白名单里才监听
const whiteList = [
  'stackoverflow.blog'
]

let wordSet = new Set()

function debounce(func, wait) {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

function highlightWordsWithObserver() {
  highlightWord()

  if (whiteList.includes(window.location.host)) {
    const debouncedHighlight = debounce(() => {
      observer.disconnect()
      highlightWord()
      observer.observe(document.body, config)
    }, 300)
  
    const config = { childList: true, subtree: true }
    const observer = new MutationObserver(() => {
      debouncedHighlight()
    })
    observer.observe(document.body, config)
  }
}

function highlightWord() {
  console.log("============== highlight word ==============")
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  )
  const textNodes = []

  let node
  while ((node = walker.nextNode())) {
    textNodes.push(node)
  }

  textNodes.forEach((node) => {
    const textContent = node.nodeValue
    const words = textContent.split(/\b/)
    let modified = false
    const newWords = words.map((word) => {
      if (wordSet.has(word.toLowerCase())) {
        modified = true
        return `<span class="highlight">${word}</span>`
      }
      return word
    })

    if (
      modified &&
      node.parentNode &&
      !node.parentNode.classList.contains("highlight")
    ) {
      const tempDiv = document.createElement("div")
      tempDiv.innerHTML = newWords.join("")

      const fragment = document.createDocumentFragment()
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild)
      }
      node.parentNode.replaceChild(fragment, node)
    }
  })
}

function refreshHighlightWord() {
  const list = document.querySelectorAll(".highlight")
  list.forEach((node) => {
    if (!wordSet.has(node.innerHTML.toLowerCase())) {
      node.classList.remove("highlight")
    }
  })
}

function updateHighlightWord(word, add = true) {
  if (add) {
    wordSet.add(word)
    highlightWord()
  } else {
    wordSet.delete(word)
    refreshHighlightWord()
  }

  chrome.storage.sync.set({ highlightWords: [...wordSet] })
}

chrome.storage.sync.get(["highlightWords"], function (result) {
  const words = result.highlightWords ?? []
  wordSet = new Set(words.map((word) => word.toLowerCase()))
  highlightWordsWithObserver()
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ON") {
    document.body.classList.remove("no-highlight")
    highlightWord()
  } else if (request.action === "OFF") {
    document.body.classList.add("no-highlight")
  }
})


document.addEventListener("click", (event) => {
  if (event.target.tagName === 'VOLC-TRANSLATE') {
    const shadowRoot = event.target.shadowRoot
    const star = shadowRoot.querySelector('.star')
    const word = shadowRoot.querySelector('.word-info-text').textContent
    if (star.classList.contains('active')) {
      updateHighlightWord(word, false)
    } else {
      updateHighlightWord(word, true)

    }
  }
})