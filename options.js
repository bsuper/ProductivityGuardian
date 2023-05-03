document.addEventListener('DOMContentLoaded', () => {
  const websiteInput = document.getElementById('website');
  const blockDurationInput = document.getElementById('block-duration');
  const addWebsiteButton = document.getElementById('add-website');
  const startBlockingButton = document.getElementById('start-blocking');
  const stopBlockingButton = document.getElementById('stop-blocking');
  const clearAllButton = document.getElementById('clear-all');
  const blocklistElement = document.getElementById('blocklist');
  const setDurationButtons = document.querySelectorAll('.set-duration');
  const blockingStatusElement = document.getElementById('blocking-status');

  function displayBlocklist(blocklist) {
    blocklistElement.innerHTML = '';

    blocklist.forEach((website) => {
      const li = document.createElement('li');
      li.textContent = website;
      blocklistElement.appendChild(li);
    });
  }

  function updateBlockingStatus(isBlocking) {
    blockingStatusElement.textContent = isBlocking ? 'Blocking is active.' : 'Blocking is inactive.';
  }

  chrome.storage.sync.get(['blocklist', 'blockDuration', 'isBlocking'], (result) => {
    const blocklist = result.blocklist || [];
    const blockDuration = result.blockDuration || 30;
    const isBlocking = result.isBlocking || false;

    displayBlocklist(blocklist);
    blockDurationInput.value = blockDuration;
    updateBlockingStatus(isBlocking);
  });

  setDurationButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const duration = parseInt(button.dataset.duration, 10);
      blockDurationInput.value = duration;
    });
  });

  addWebsiteButton.addEventListener('click', () => {
    const website = websiteInput.value.trim();

    if (!website) return;

    chrome.storage.sync.get('blocklist', (result) => {
      const blocklist = result.blocklist || [];
      blocklist.push(website);
      displayBlocklist(blocklist);

      chrome.storage.sync.set({ blocklist });
    });

    websiteInput.value = '';
  });

  startBlockingButton.addEventListener('click', () => {
    const blockDuration = parseInt(blockDurationInput.value, 10);
    if (blockDuration > 0) {
      chrome.storage.sync.set({ blockDuration }, () => {
        chrome.runtime.sendMessage({ action: 'startBlocking' });
      });

      chrome.storage.sync.set({ isBlocking: true }, () => {
        updateBlockingStatus(true);
      });
    }
  });

  stopBlockingButton.addEventListener('click', () => {
    chrome.storage.sync.set({ isBlocking: false }, () => {
      updateBlockingStatus(false);
      chrome.runtime.sendMessage({ action: 'updateBlockingRules' });
    });
  });

  clearAllButton.addEventListener('click', () => {
    chrome.storage.sync.set({ blocklist: [] }, () => {
      displayBlocklist([]);
      chrome.runtime.sendMessage({ action: 'updateBlockingRules' });
    });
  });
});
