"use strict";
(() => {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
        if (msg?.type !== 'captureVisibleTab')
            return;
        const windowId = sender.tab?.windowId;
        if (windowId === undefined) {
            sendResponse({ error: 'no windowId' });
            return true;
        }
        chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message ?? 'capture failed' });
            }
            else {
                sendResponse({ dataUrl });
            }
        });
        return true;
    });
})();
