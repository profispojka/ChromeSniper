import {
  addItem as historyAdd,
  listItems as historyList,
  getItemDataUrl as historyGet,
  deleteItem as historyDelete,
  clearAll as historyClear,
  type HistoryKind,
  type HistoryListItem,
} from './historyStore.js';

(() => {
  type CaptureMessage = { type: 'captureVisibleTab' };
  type CaptureResponse =
    | { dataUrl: string; error?: undefined }
    | { dataUrl?: undefined; error: string };

  type SaveScreenshotMessage = {
    type: 'saveScreenshot';
    dataUrl: string;
    pageUrl: string;
    pageTitle: string;
    kind: HistoryKind;
    width: number;
    height: number;
  };
  type SaveScreenshotResponse =
    | { ok: true; id: string; pruned: number }
    | { ok: false; error: string };

  type ListScreenshotsMessage = { type: 'listScreenshots' };
  type ListScreenshotsResponse =
    | { ok: true; items: HistoryListItem[] }
    | { ok: false; error: string };

  type GetScreenshotMessage = { type: 'getScreenshot'; id: string };
  type GetScreenshotResponse =
    | { ok: true; dataUrl: string }
    | { ok: false; error: string };

  type DeleteScreenshotMessage = { type: 'deleteScreenshot'; id: string };
  type ClearScreenshotsMessage = { type: 'clearScreenshots' };
  type SimpleAckResponse = { ok: true } | { ok: false; error: string };

  type HistoryMessage =
    | SaveScreenshotMessage
    | ListScreenshotsMessage
    | GetScreenshotMessage
    | DeleteScreenshotMessage
    | ClearScreenshotsMessage;

  type AnyResponse =
    | CaptureResponse
    | SaveScreenshotResponse
    | ListScreenshotsResponse
    | GetScreenshotResponse
    | SimpleAckResponse;

  type Message = CaptureMessage | HistoryMessage;

  const handleCapture = (
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: CaptureResponse) => void,
  ): true => {
    const windowId = sender.tab?.windowId;
    if (windowId === undefined) {
      sendResponse({ error: 'no windowId' });
      return true;
    }
    chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message ?? 'capture failed' });
      } else {
        sendResponse({ dataUrl });
      }
    });
    return true;
  };

  const errMsg = (e: unknown): string => (e instanceof Error ? e.message : String(e));

  const handleHistory = async (
    msg: HistoryMessage,
    sendResponse: (r: AnyResponse) => void,
  ): Promise<void> => {
    try {
      if (msg.type === 'saveScreenshot') {
        const out = await historyAdd({
          dataUrl: msg.dataUrl,
          pageUrl: msg.pageUrl,
          pageTitle: msg.pageTitle,
          kind: msg.kind,
          width: msg.width,
          height: msg.height,
        });
        sendResponse({ ok: true, id: out.id, pruned: out.pruned });
        return;
      }
      if (msg.type === 'listScreenshots') {
        const items = await historyList();
        sendResponse({ ok: true, items });
        return;
      }
      if (msg.type === 'getScreenshot') {
        const dataUrl = await historyGet(msg.id);
        if (dataUrl === null) {
          sendResponse({ ok: false, error: 'not found' });
          return;
        }
        sendResponse({ ok: true, dataUrl });
        return;
      }
      if (msg.type === 'deleteScreenshot') {
        await historyDelete(msg.id);
        sendResponse({ ok: true });
        return;
      }
      if (msg.type === 'clearScreenshots') {
        await historyClear();
        sendResponse({ ok: true });
        return;
      }
    } catch (err) {
      sendResponse({ ok: false, error: errMsg(err) });
    }
  };

  chrome.runtime.onMessage.addListener(
    (
      msg: Message,
      sender,
      sendResponse: (response: AnyResponse) => void,
    ) => {
      if (msg?.type === 'captureVisibleTab') {
        return handleCapture(sender, sendResponse as (r: CaptureResponse) => void);
      }
      if (
        msg?.type === 'saveScreenshot' ||
        msg?.type === 'listScreenshots' ||
        msg?.type === 'getScreenshot' ||
        msg?.type === 'deleteScreenshot' ||
        msg?.type === 'clearScreenshots'
      ) {
        void handleHistory(msg, sendResponse);
        return true;
      }
      return undefined;
    },
  );

  chrome.commands?.onCommand?.addListener?.(async (command) => {
    if (command !== 'capture-full-page') return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return;
      await chrome.tabs.sendMessage(tab.id, { type: 'startFullPageCapture' });
    } catch (err) {
      console.warn('capture-full-page command failed', err);
    }
  });
})();
