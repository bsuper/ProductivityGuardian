document.addEventListener("DOMContentLoaded", () => {
  const toggleBlockingButton = document.getElementById("toggle-blocking");
  const openOptionsButton = document.getElementById("open-options");
  const addWebsiteButton = document.getElementById("add-website");
  const blockedWebsitesListElement = document.getElementById("blocked-websites-list");
  const timeRemainingElement = document.getElementById("time-remaining");
  const websiteInput = document.getElementById("website");
  const errorMessageElement = document.getElementById("error-message");
  const setDurationButtons = document.querySelectorAll(".set-duration");

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

  function displayBlockedWebsites(blocklist) {
    blockedWebsitesListElement.innerHTML = '';
    blocklist.forEach(website => {
      const listItem = document.createElement("li");
      listItem.textContent = website;
      listItem.classList.add("text-gray-700", "text-sm");
      blockedWebsitesListElement.appendChild(listItem);
    });
  }

  function updateTimeRemaining() {
    chrome.storage.sync.get(["isBlocking", "blockingEndTime"], (result) => {
      const isBlocking = result.isBlocking || false;
      const blockingEndTime = result.blockingEndTime || null;

      if (isBlocking && blockingEndTime) {
        const remainingTime = blockingEndTime - Date.now();
        if (remainingTime <= 0) {
          timeRemainingElement.textContent = "Block time has ended.";
          clearInterval(timeRemainingInterval);
        } else {
          const minutes = Math.floor(remainingTime / (60 * 1000));
          const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
          timeRemainingElement.textContent = `${minutes}m ${seconds}s`;
        }
      } else {
        timeRemainingElement.textContent = "N/A";
        clearInterval(timeRemainingInterval);
      }
    });
  }

  function updatePopupInfo() {
    chrome.storage.sync.get(["blocklist"], (result) => {
      const blocklist = result.blocklist || [];
      displayBlockedWebsites(blocklist);
    });
    updateTimeRemaining();
  }

  let timeRemainingInterval = setInterval(updateTimeRemaining, 1000);

  toggleBlockingButton.addEventListener("click", () => {
    chrome.storage.sync.get("isBlocking", (result) => {
      const isBlocking = !result.isBlocking;
      chrome.storage.sync.set({ isBlocking }, () => {
        chrome.runtime.sendMessage({ action: "updateBlockingRules" });
        updatePopupInfo();
      });
    });
  });

  setDurationButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const duration = parseInt(button.getAttribute("data-duration"), 10) * 60 * 1000; // Convert minutes to milliseconds
      chrome.storage.sync.set({ isBlocking: true, blockingEndTime: Date.now() + duration }, () => {
        chrome.runtime.sendMessage({ action: "updateBlockingRules" });
        updatePopupInfo();
      });
    });
  });

  openOptionsButton.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  addWebsiteButton.addEventListener("click", () => {
    const website = websiteInput.value.trim();

    if (!website) {
      displayError("Please enter a website.");
      return;
    }

    const normalizedUrl = normalizeUrl(website);
    if (!isValidUrl(normalizedUrl)) {
      displayError("Please enter a valid website URL.");
      return;
    }

    chrome.storage.sync.get("blocklist", (result) => {
      const blocklist = result.blocklist || [];
      if (blocklist.includes(normalizedUrl)) {
        displayError("This website is already in the blocklist.");
        return;
      }
      blocklist.push(normalizedUrl);

      chrome.storage.sync.set({ blocklist }, () => {
        chrome.runtime.sendMessage({ action: "updateBlockingRules" });
        updatePopupInfo();
      });
    });

    websiteInput.value = "";
    displayError("");
  });

  updatePopupInfo();
});

