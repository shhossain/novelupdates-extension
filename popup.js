async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true };
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function sendMessage(data) {
  const tab = await getCurrentTab();
  chrome.tabs.sendMessage(tab.id, { action: "updateData", data: data });
}

const saveOptions = () => {
  const topN = document.getElementById("topN").value;
  const w1 = document.getElementById("w1").value;
  const w2 = document.getElementById("w2").value;
  const w3 = document.getElementById("w3").value;
  chrome.storage.sync.set({ topN: topN, w1: w1, w2: w2, w3: w3 }, () => {
    // Send a message to the content script with the updated topN value
    sendMessage({ topN: topN, w1: w1, w2: w2, w3: w3 });
  });
};

// Function to restore the selected topN value from storage
const restoreOptions = () => {
  chrome.storage.sync.get({ topN: 10, w1: 1, w2: 0.4, w3: 0.3 }, (items) => {
    document.getElementById("topN").value = items.topN;
    document.getElementById("w1").value = items.w1;
    document.getElementById("w2").value = items.w2;
    document.getElementById("w3").value = items.w3;
  });
};

const resetOptions = () => {
  chrome.storage.sync.set({ topN: 10, w1: 1, w2: 0.4, w3: 0.3 }, () => {
    document.getElementById("topN").value = 10;
    document.getElementById("w1").value = 1;
    document.getElementById("w2").value = 0.4;
    document.getElementById("w3").value = 0.3;
    sendMessage({ topN: 10, w1: 1, w2: 0.4, w3: 0.3 });
  });
};

// Event listener for the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  // check if is novel page
  let novelPage = true;
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    if (!url.includes("novelupdates.com/series/")) {
      // change body size
      document.body.style.width = "200px";
      document.body.style.height = "20px";
      document.body.innerHTML = "<div class='text-center'>Please open a series page to use this extension.</div>";
      novelPage = false;
    }
  });
  if (!novelPage) {
    return;
  }

  // Add event listener for the save button when the popup is opened
  document.getElementById("save").addEventListener("click", saveOptions);

  document.getElementById("reset").addEventListener("click", resetOptions);

  document.getElementById("close").addEventListener("click", () => {
    window.close();
  });

  // // Restore the options when the popup is opened
  restoreOptions();

  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});
