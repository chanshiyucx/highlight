/**
 * ================================================
 *                    单词高亮
 * ================================================
 */
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

function updateHighlightWord(word, add = true) {
  if (add) {
    wordSet.add(word)
    highlightWord()
  } else {
    wordSet.delete(word)
    const list = document.querySelectorAll(".highlight")
    list.forEach((node) => {
      if (node.innerHTML.toLowerCase() === word.toLowerCase()) {
        node.classList.remove("highlight")
      }
    })
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

/**
 * ================================================
 *                    浮标管理
 * ================================================
 */

function createTooltip(text, x, y) {
  const existingTooltip = document.querySelector(".selection-tooltip")
  if (existingTooltip) {
    existingTooltip.remove()
  }

  const tooltip = document.createElement("div")
  tooltip.classList.add("selection-tooltip")
  tooltip.textContent = wordSet.has(text) ? "取消高亮" : "设置高亮"
  tooltip.style.position = "absolute"
  tooltip.style.top = `${y}px`
  tooltip.style.left = `${x}px`
  tooltip.style.padding = "10px"
  tooltip.style.background = "#333"
  tooltip.style.color = "#fff"
  tooltip.style.borderRadius = "5px"
  tooltip.style.zIndex = "9999"
  tooltip.style.cursor = "pointer"

  tooltip.addEventListener("click", () => {
    updateHighlightWord(text, !wordSet.has(text))
    tooltip.remove()
  })

  document.body.appendChild(tooltip)
}

document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection()
  const selectedText = selection.toString().trim()

  if (selectedText.length > 0) {
    const range = selection.getRangeAt(0).getBoundingClientRect()
    const tooltipX = range.right
    const tooltipY = range.bottom + window.scrollY
    createTooltip(selectedText, tooltipX, tooltipY)
  }
})

document.addEventListener("mousedown", (event) => {
  const existingTooltip = document.querySelector(".selection-tooltip")
  if (existingTooltip && !existingTooltip.contains(event.target)) {
    existingTooltip.remove()
  }
})
