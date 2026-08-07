/**
 * Service worker (Chrome) / event script (Firefox) — registers the context
 * menu and relays menu clicks + the Alt+K command to the content script.
 * All conversion happens in the content script; nothing runs here but
 * message plumbing.
 */
const MENU_ID = 'kokey-fix'

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'kokey: fix mistyped text / 자판 착오 복원',
    contexts: ['selection', 'editable']
  })
})

async function sendFix(tab) {
  let tabId = tab?.id
  if (tabId == null) {
    const [active] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    tabId = active?.id
  }
  if (tabId == null) return
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'kokey-fix' })
  } catch {
    // no content script on this page (chrome:// etc.) — nothing to do
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID) sendFix(tab)
})

chrome.commands.onCommand.addListener((command, tab) => {
  if (command === 'kokey-fix') sendFix(tab)
})
