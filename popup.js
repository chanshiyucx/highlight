document.getElementById("btn-on").addEventListener("click", () => {
  sendMessage("ON")
})

document.getElementById("btn-off").addEventListener("click", () => {
  sendMessage("OFF")
})

document.getElementById("btn-option").addEventListener("click", () => {
  chrome.runtime.openOptionsPage()
})

function sendMessage(action) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action }, () => {})
  })
}
