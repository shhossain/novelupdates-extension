// Retrieve the novel name from the URL
const url = document.querySelector('link[rel="canonical"]').href;
const parts = url.split("/");
const novelName = parts[parts.length - 2];
let timer = null;

const apiURL = "https://shhossain.pythonanywhere.com";

// Function to show a loading message
const show_loading = (element) => {
  const loadingElement = document.createElement("span");
  loadingElement.id = "loading";
  loadingElement.classList.add("loading");
  loadingElement.textContent = "Loading...";
  element.appendChild(loadingElement);

  let dots = "";

  const animateLoading = () => {
    loadingElement.textContent = `Loading${dots}`;
    dots = dots.length < 3 ? dots + "." : "";
  };

  // Start the animation
  timer = setInterval(animateLoading, 500);
};

const hide_loading = (txt = null) => {
  if (timer) {
    clearTimeout(timer);
  }

  const loading = document.getElementById("loading");
  if (loading) {
    if (txt != null) {
      loading.innerText = txt;
    } else {
      loading.remove();
    }
  }
};

async function fetchRecommendations({ topN, w1, w2, w3 }) {
  // Send a request to the API with the novel name and topN value. catch error if any
  try {
    const url = `${apiURL}/api/recommend?url=${novelName}&top_n=${topN}&w1=${w1}&w2=${w2}&w3=${w3}`;
    const response = await fetch(url);
    const data = await response.json();
    const recommendations = data.recommendations;
    const container = document.createElement("div");
    container.id = "recomendations";

    for (const recommendation of recommendations) {
      const { url, similarity, score } = recommendation;
      let urlParts = url.split("-");
      let novelName = "";
      for (let i = 0; i < urlParts.length; i++) {
        novelName +=
          urlParts[i].charAt(0).toUpperCase() + urlParts[i].slice(1) + " ";
      }
      novelName = decodeURIComponent(novelName.trim());

      const link = document.createElement("a");
      link.className = "genre";
      link.href = "https://www.novelupdates.com/series/" + url;
      link.textContent = novelName;

      container.appendChild(link);
      container.appendChild(document.createElement("br"));
    }

    // Remove previous recommendations, if any
    const existingRecommendations =
      document.querySelectorAll("#recomendations");
    for (const existingRecommendation of existingRecommendations) {
      existingRecommendation.remove();
    }

    const recContainer = document.querySelector("#rec-container");
    recContainer.appendChild(container);

    return true;
  } catch (error) {
    console.log("Error fetching recommendations:", error);
    return false;
  }
}

// Function to add the recommendations container to the page
async function addRecommendationsContainer(data) {
  const erec = document.querySelector("#rec-container");
  if (!erec) {
    const title = document.createElement("h5");
    title.className = "seriesother";
    title.textContent = "Recommendations (AI)";

    const recContainer = document.createElement("div");
    recContainer.id = "rec-container";
    recContainer.appendChild(title);

    let el = document.querySelectorAll("h5.seriesother");
    // get the h5 with textContent "Recommendations [Edit]"
    for (let i = 0; i < el.length; i++) {
      if (el[i].textContent.includes("Recommendations")) {
        // insert the recContainer before the h5
        el[i].parentNode.insertBefore(recContainer, el[i]);
      }
    }
  }

  show_loading(document.querySelector("#rec-container"));

  // Call the fetchRecommendations function with the topN value
  let success = false;
  let i = 0;
  let running = false;
  const ftimer = setInterval(async () => {
    if (running) {
      return;
    }
    running = true;
    success = await fetchRecommendations(data);
    running = false;
    if (success) {
      clearInterval(ftimer);
      hide_loading();
    }
    if (i == 10) {
      clearInterval(ftimer);
      hide_loading("Failed to load recommendations");
    }
    i++;
  }, 1000);
}

// Message listener to receive the updated topN value from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateData") {
    const data = request.data;
    addRecommendationsContainer(data);
  }
});

// Function to get the selected topN value from storage
const getTopN = () => {
  chrome.storage.sync.get({ topN: 10, w1: 0.5, w2: 0.3, w3: 0.2 }, (data) => {
    addRecommendationsContainer(data);
  });
};

getTopN();
