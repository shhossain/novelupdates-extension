const url = window.location.href;
const apiURL = "http://localhost:5000";

function getNovelUrls() {
  // all a tags
  const aTags = document.querySelectorAll("a");
  const novelUrls = [];
  for (const aTag of aTags) {
    const href = aTag.href;
    if (href.includes("novelupdates.com/series/")) {
      novelUrls.push(href);
    }
  }
  return novelUrls;
}

async function addDescriptions() {
  const novelUrls = getNovelUrls();
  const url = `${apiURL}/api/descriptions`;

  const urls = novelUrls.join(",");

  const response = await fetch(url, {
    method: "POST",
    body: urls,
  });
  const descriptions = await response.json();

  const novels = document.querySelectorAll(".search_body_nu");
  for (let i = 0; i < novels.length; i++) {
    const novel = novels[i];
    const atag = novel.querySelector("a");
    let url = atag.href;
    url = url.split("/");
    url = url[url.length - 2];
    let description = null;
    for (const desc of descriptions) {
      if (desc.url === url) {
        description = desc.description;
        break;
      }
    }
    if (description) {
      const div = document.createElement("div");
      div.style.display = "none";
      const p = document.createElement("p");
      p.innerText = description;
      const br = document.createElement("br");
      div.appendChild(br);
      div.appendChild(p);
      novel.appendChild(div);

      const button = document.createElement("button");
      button.innerHTML = "Show Description";
      button.style =
        "margin-left: 10px; color: #fff; background-color: rgb(35, 50, 64) !important; border: 1px solid rgb(35, 50, 64) !important; border-radius: 3px; padding: 5px 10px; font-size: 12px; font-weight: 700; cursor: pointer;";
      button.addEventListener("click", () => {
        if (div.style.display === "none") {
          div.style.display = "block";
          button.innerHTML = "Hide Description";
        } else {
          div.style.display = "none";
          button.innerHTML = "Show Description";
        }
      });

      novel.appendChild(button);
    }
  }
}

addDescriptions();
