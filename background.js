chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ blocklist: [], blockDuration: 1800 });
  updateBlockingRules();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.blocklist || changes.blockDuration) {
      updateBlockingRules();
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'updateBlockingRules') {
    updateBlockingRules();
  }
});

function updateBlockingRules() {
  chrome.storage.sync.get(['blocklist', 'blockDuration'], (result) => {
    const blocklist = result.blocklist || [];
    const blockDuration = result.blockDuration || 30;

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
              type: 'block',
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




updateBlockingRules();
