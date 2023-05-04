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
  const errorMessageElement = document.getElementById('error-message');

  function displayError(message) {
    errorMessageElement.textContent = message;
  }

  function isValidUrl(domain) {
    const regex = /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/;
    return regex.test(domain);
  }
  

  function normalizeUrl(url) {
    try {
      const parsedUrl = new URL(url.startsWith('http://') || url.startsWith('https://') ? url : 'http://' + url);
      return parsedUrl.hostname;
    } catch {
      return '';
    }
  }
  

  function displayBlocklist(blocklist) {
    blocklistElement.innerHTML = '';

    blocklist.forEach((website) => {
      const li = document.createElement('li');
      li.className = 'bg-gray-100 p-2 rounded-lg flex justify-between items-center';
      li.textContent = website;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'bg-red-500 text-white px-4 py-2 rounded-lg';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', () => {
        removeFromBlocklist(website);
      });

      li.appendChild(removeBtn);
      blocklistElement.appendChild(li);
    });
  }

  function removeFromBlocklist(website) {
    chrome.storage.sync.get('blocklist', (result) => {
      const blocklist = result.blocklist || [];
      const updatedBlocklist = blocklist.filter((item) => item !== website);

      chrome.storage.sync.set({ blocklist: updatedBlocklist }, () => {
        displayBlocklist(updatedBlocklist);
        chrome.runtime.sendMessage({ action: 'updateBlockingRules' });
      });
    });
  }

  function displayRemainingTime(blockingEndTime) {
    const timeRemainingElement = document.getElementById('time-remaining');

    if (!blockingEndTime) {
      timeRemainingElement.textContent = '';
      return;
    }

    const remainingTime = blockingEndTime - Date.now();
    if (remainingTime <= 0) {
      timeRemainingElement.textContent = 'Block time has ended.';
      return;
    }

    const minutes = Math.floor(remainingTime / (60 * 1000));
    const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
    timeRemainingElement.textContent = `Time remaining: ${minutes}m ${seconds}s`;
  }

  let countdownInterval;

  function updateBlockingStatus(isBlocking, blockingEndTime) {
    blockingStatusElement.textContent = isBlocking ? 'Blocking is active.' : 'Blocking is inactive.';
    displayRemainingTime(blockingEndTime);

    if (isBlocking) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      countdownInterval = setInterval(() => {
        displayRemainingTime(blockingEndTime);
      }, 1000);
    } else {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      displayRemainingTime(null); // Clear the remaining time display when blocking is inactive
    }
  }

  chrome.storage.sync.get(['blocklist', 'blockDuration', 'isBlocking', 'blockingEndTime'], (result) => {
    const blocklist = result.blocklist || [];
    const blockDuration = result.blockDuration || 25; // Change the default blockDuration value here
    const isBlocking = result.isBlocking || false;
    const blockingEndTime = result.blockingEndTime || null;

    displayBlocklist(blocklist);
    blockDurationInput.value = blockDuration;
    updateBlockingStatus(isBlocking, blockingEndTime);
  });

  setDurationButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const duration = parseInt(button.dataset.duration, 10);
      blockDurationInput.value = duration;
    });
  });

  addWebsiteButton.addEventListener('click', () => {
    const website = websiteInput.value.trim();

    if (!website) {
      displayError('Please enter a website.');
      return;
    }

    const normalizedUrl = normalizeUrl(website);
    if (!isValidUrl(normalizedUrl)) {
      displayError('Please enter a valid website URL.');
      return;
    }

    chrome.storage.sync.get('blocklist', (result) => {
      const blocklist = result.blocklist || [];
      if (blocklist.includes(normalizedUrl)) {
        displayError('This website is already in the blocklist.');
        return;
      }
      blocklist.push(normalizedUrl);
      displayBlocklist(blocklist);

      chrome.storage.sync.set({ blocklist });
    });

    websiteInput.value = '';
    displayError('');
  });

  startBlockingButton.addEventListener('click', () => {
    const blockDuration = parseInt(blockDurationInput.value, 10);
    if (blockDuration <= 0) {
      displayError('Please enter a positive duration for blocking.');
      return;
    }

    const blockingEndTime = Date.now() + blockDuration * 60 * 1000;
    chrome.storage.sync.set({ blockDuration, blockingEndTime }, () => {
      chrome.runtime.sendMessage({ action: 'startBlocking' });
    });

    chrome.storage.sync.set({ isBlocking: true }, () => {
      updateBlockingStatus(true, blockingEndTime);
    });

    displayError('');
  });

  stopBlockingButton.addEventListener('click', () => {
    chrome.storage.sync.set({ isBlocking: false }, () => {
      updateBlockingStatus(false, null);
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

