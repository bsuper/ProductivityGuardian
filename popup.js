document.addEventListener("DOMContentLoaded", () => {
  const toggleBlockingButton = document.getElementById("toggle-blocking");
  const openOptionsButton = document.getElementById("open-options");
  const addWebsiteButton = document.getElementById("add-website");
  const blockedWebsitesCountElement = document.getElementById(
    "blocked-websites-count"
  );
  const timeRemainingElement = document.getElementById("time-remaining");
  const websiteInput = document.getElementById("website");
  const errorMessageElement = document.getElementById("error-message");

  function displayError(message) {
    errorMessageElement.textContent = message;
  }

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function normalizeUrl(url) {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return "http://" + url;
  }

  function updatePopupInfo() {
    chrome.storage.sync.get(
      ["blocklist", "isBlocking", "blockingEndTime"],
      (result) => {
        const blocklist = result.blocklist || [];
        const isBlocking = result.isBlocking || false;
        const blockingEndTime = result.blockingEndTime || null;

        blockedWebsitesCountElement.textContent = blocklist.length;

        if (isBlocking && blockingEndTime) {
          const remainingTime = blockingEndTime - Date.now();
          if (remainingTime <= 0) {
            timeRemainingElement.textContent = "Block time has ended.";
          } else {
            const minutes = Math.floor(remainingTime / (60 * 1000));
            const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
            timeRemainingElement.textContent = `${minutes}m ${seconds}s`;
          }
        } else {
          timeRemainingElement.textContent = "N/A";
        }
      }
    );
  }

  toggleBlockingButton.addEventListener("click", () => {
    chrome.storage.sync.get("isBlocking", (result) => {
      const isBlocking = !result.isBlocking;
      chrome.storage.sync.set({ isBlocking }, () => {
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
