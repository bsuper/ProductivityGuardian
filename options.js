document.addEventListener('DOMContentLoaded', () => {
  const websiteInput = document.getElementById('website-input');
  const addWebsiteForm = document.getElementById('add-website-form');
  const blocklist = document.getElementById('blocklist');
  const blockDurationInput = document.getElementById('block-duration-input');
  const clearAllButton = document.getElementById('clear-all-button');

  function createWebsiteListItem(website) {
    const listItem = document.createElement('li');
    listItem.className = 'flex items-center justify-between py-4';

    const websiteText = document.createElement('span');
    websiteText.textContent = website;
    listItem.appendChild(websiteText);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.className = 'bg-red-500 text-white rounded-md px-4 py-2';
    listItem.appendChild(removeButton);

    removeButton.addEventListener('click', () => {
      chrome.storage.sync.get(['blocklist'], (result) => {
        const blocklistItems = result.blocklist || [];
        const newBlocklist = blocklistItems.filter((item) => item !== website);
        chrome.storage.sync.set({ blocklist: newBlocklist });
        blocklist.removeChild(listItem);
      });
    });

    return listItem;
  }

  function loadOptions() {
    chrome.storage.sync.get(['blocklist', 'blockDuration'], (result) => {
      const blocklistItems = result.blocklist || [];
      const blockDuration = result.blockDuration || 30;

      blocklistItems.forEach((website) => {
        const listItem = createWebsiteListItem(website);
        blocklist.appendChild(listItem);
      });

      blockDurationInput.value = blockDuration;
    });
  }

  function saveBlockDuration() {
    const blockDuration = parseInt(blockDurationInput.value, 10);
    chrome.storage.sync.set({ blockDuration: blockDuration });
  }

  function addWebsite(event) {
    event.preventDefault();
    const website = websiteInput.value.trim();

    if (!website) {
      return;
    }

    chrome.storage.sync.get(['blocklist'], (result) => {
      const blocklistItems = result.blocklist || [];

      if (!blocklistItems.includes(website)) {
        blocklistItems.push(website);
        chrome.storage.sync.set({ blocklist: blocklistItems });

        const listItem = createWebsiteListItem(website);
        blocklist.appendChild(listItem);
      }
    });

    websiteInput.value = '';
  }

  function clearBlocklist() {
    chrome.storage.sync.set({ blocklist: [] }, () => {
      // Clear the blocklist in the UI
      while (blocklist.firstChild) {
        blocklist.removeChild(blocklist.firstChild);
      }
      // Notify background.js to update the blocking rules
      chrome.runtime.sendMessage({ type: 'updateBlockingRules' });
    });
  }
  

  addWebsiteForm.addEventListener('submit', addWebsite);
  blockDurationInput.addEventListener('change', saveBlockDuration);
  clearAllButton.addEventListener('click', clearBlocklist);

  loadOptions();
});
