document.addEventListener('DOMContentLoaded', () => {
  const pauseButton = document.getElementById('pause-button');
  const blockedWebsitesCount = document.getElementById('blocked-websites-count');
  const remainingBlockDuration = document.getElementById('remaining-block-duration');

  // Get and display blocklist and block duration
  chrome.storage.sync.get(['blocklist', 'blockDuration'], (result) => {
    const blocklist = result.blocklist || [];
    const blockDuration = result.blockDuration || 1800;

    blockedWebsitesCount.textContent = blocklist.length;
    const minutes = Math.floor(blockDuration / 60);
    const seconds = blockDuration % 60;
    remainingBlockDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Start countdown if there are blocked websites
    if (blocklist.length > 0) {
      startCountdown(blockDuration);
    }
  });

  // Toggle pause/resume functionality
  let isPaused = false;
  let countdownInterval;
  pauseButton.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    if (isPaused) {
      clearInterval(countdownInterval);
    } else {
      chrome.storage.sync.get(['blockDuration'], (result) => {
        const blockDuration = result.blockDuration || 1800;
        const remainingDuration = parseInt(remainingBlockDuration.textContent.split(':')[0]) * 60 + parseInt(remainingBlockDuration.textContent.split(':')[1]);
        startCountdown(remainingDuration);
      });
    }
  });

  // Countdown function
  function startCountdown(duration) {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      if (duration > 0) {
        duration -= 1;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        remainingBlockDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        clearInterval(countdownInterval);
      }
    }, 1000); // Update every second
  }
});

