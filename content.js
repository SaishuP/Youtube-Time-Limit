setInterval(() => {
    chrome.storage.local.get(['watchTime'], function (result) {
      let currentTime = result.watchTime || 0;
      currentTime += 1 / 60; // add 1 second every minute
      chrome.storage.local.set({ watchTime: currentTime });
    });
  }, 1000);
  