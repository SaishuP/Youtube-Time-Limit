let watchTime = 0;

// Initialize watch time and set the reset alarm when the extension is loaded
chrome.runtime.onStartup.addListener(initialize);
chrome.runtime.onInstalled.addListener(initialize);

function initialize() {
  chrome.storage.local.get(['watchTime', 'lastReset', 'timeLimit', 'bypassLinks'], function (result) {
    const now = new Date();
    const today = now.toDateString();
    
    // If the last reset was on a different day, reset the watch time
    if (result.lastReset !== today) {
      chrome.storage.local.set({ watchTime: 0, lastReset: today });
    } else {
      watchTime = result.watchTime || 0;
    }

    // Set the reset alarm for midnight
    const nextReset = new Date(now);
    nextReset.setHours(24, 0, 0, 0); // set to midnight
    const timeUntilReset = nextReset.getTime() - now.getTime();
    chrome.alarms.create('resetWatchTime', { when: Date.now() + timeUntilReset });
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'resetWatchTime') {
    // Reset the watch time and set the next reset alarm
    chrome.storage.local.set({ watchTime: 0, lastReset: new Date().toDateString() });
    initialize();
  }

  if (alarm.name === 'checkYouTubeTime') {
    chrome.storage.local.get(['watchTime', 'timeLimit', 'bypassLinks'], function (result) {
      const timeLimit = result.timeLimit || 30;
      const bypassLinks = result.bypassLinks || [];
      
      // Check if any open YouTube tab is not in the bypass list
      chrome.tabs.query({ url: '*://*.youtube.com/*' }, function (tabs) {
        const nonBypassedTabs = tabs.filter(tab => !bypassLinks.some(link => tab.url.includes(link)));

        if (result.watchTime >= timeLimit && nonBypassedTabs.length > 0) {
          nonBypassedTabs.forEach((tab) => chrome.tabs.remove(tab.id));
          alert('You have reached your YouTube watch limit for today!');
        }
      });
    });
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url.includes('youtube.com') && changeInfo.status === 'complete') {
    chrome.storage.local.get(['watchTime'], function (result) {
      watchTime = result.watchTime || 0;
      chrome.alarms.create('checkYouTubeTime', { delayInMinutes: 1 });
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (watchTime > 0) {
    chrome.storage.local.set({ watchTime: watchTime });
  }
});

// Increment watch time every minute for non-bypassed links
setInterval(() => {
  chrome.storage.local.get(['bypassLinks'], function (result) {
    const bypassLinks = result.bypassLinks || [];
    chrome.tabs.query({ url: '*://*.youtube.com/*' }, function (tabs) {
      const nonBypassedTabs = tabs.filter(tab => !bypassLinks.some(link => tab.url.includes(link)));

      if (nonBypassedTabs.length > 0) {
        watchTime += 1 / 60; // Increment by 1 minute every minute
        chrome.storage.local.set({ watchTime: watchTime });
      }
    });
  });
}, 60000); // 60000ms = 1 minute
