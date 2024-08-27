document.addEventListener('DOMContentLoaded', function () {
  chrome.storage.local.get(['watchTime', 'timeLimit'], function (result) {
    const timeLimit = result.timeLimit || 30; // default to 30 minutes
    const remainingTime = Math.max(0, timeLimit - (result.watchTime || 0));
    document.getElementById('remainingTime').innerText = remainingTime.toFixed(2);
    document.getElementById('timerLimit').value = timeLimit;
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
});
