chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blocklist: [], blockDuration: 1800 });
  updateBlockingRules();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startBlocking') {
    updateBlockingRules();
  } else if (request.action === 'updateBlockingRules') {
    updateBlockingRules();
  }
});

function updateBlockingRules() {
  chrome.storage.sync.get(['isBlocking', 'blocklist', 'blockDuration'], (result) => {
    const isBlocking = result.isBlocking || false;
    const blocklist = result.blocklist || [];
    const blockDuration = result.blockDuration || 30;

    if (!isBlocking) {
      removeAllRules();
      return;
    }

    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const removeRuleIds = existingRules.map((rule) => rule.id);

      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: removeRuleIds,
        },
        () => {
          const rules = blocklist.map((website, index) => ({
            id: index + 1,
            priority: 1,
            action: {
              type: 'redirect',
              redirect: { url: "https://yahoo.com" },
            },
            condition: {
              urlFilter: `*://*${website}*`,
              resourceTypes: ['main_frame'],
            },
          }));

          chrome.declarativeNetRequest.updateDynamicRules({
            addRules: rules,
          });
        }
      );
    });
  });
}

function removeAllRules() {
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    const removeRuleIds = existingRules.map((rule) => rule.id);

    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: removeRuleIds,
    });
  });
}
