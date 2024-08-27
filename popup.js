document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get(['watchTime', 'timeLimit', 'bypassLinks'], function (result) {
    const timeLimit = result.timeLimit || 30; // default to 30 minutes
    const remainingTime = Math.max(0, timeLimit - (result.watchTime || 0));
    document.getElementById('remainingTime').innerText = remainingTime.toFixed(2);
    document.getElementById('timerLimit').value = timeLimit;

    const bypassLinks = result.bypassLinks || [];
    const bypassList = document.getElementById('bypassList');
    bypassList.innerHTML = '';
    bypassLinks.forEach((link, index) => {
      const li = document.createElement('li');
      li.innerText = link;
      const removeBtn = document.createElement('button');
      removeBtn.innerText = 'Remove';
      removeBtn.style.marginLeft = '10px';
      removeBtn.onclick = function () {
        removeBypassLink(index);
      };
      li.appendChild(removeBtn);
      bypassList.appendChild(li);
    });
  });

  document.getElementById('saveLimit').addEventListener('click', function () {
    const newLimit = parseInt(document.getElementById('timerLimit').value, 10);
    if (newLimit > 0) {
      chrome.storage.local.set({ timeLimit: newLimit });
      alert('New time limit saved!');
    } else {
      alert('Please enter a valid number greater than 0.');
    }
  });

  document.getElementById('addBypass').addEventListener('click', function () {
    const newLink = document.getElementById('bypassLink').value.trim();
    if (newLink && newLink.includes('youtube.com')) {
      chrome.storage.local.get(['bypassLinks'], function (result) {
        const bypassLinks = result.bypassLinks || [];
        bypassLinks.push(newLink);
        chrome.storage.local.set({ bypassLinks: bypassLinks }, function () {
          location.reload();
        });
      });
    } else {
      alert('Please enter a valid YouTube link.');
    }
  });

  function removeBypassLink(index) {
    chrome.storage.local.get(['bypassLinks'], function (result) {
      const bypassLinks = result.bypassLinks || [];
      bypassLinks.splice(index, 1);
      chrome.storage.local.set({ bypassLinks: bypassLinks }, function () {
        location.reload();
      });
    });
  }
});
