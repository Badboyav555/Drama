const params = new URLSearchParams(window.location.search);
const dramaId = params.get("id");

async function loadDrama() {
  const res = await fetch(`data/dramas/${dramaId}.json`);
  const drama = await res.json();
  const container = document.getElementById("story-container");
  let seasonsHtml = "";
  for (let s of drama.seasons) {
    let episodesHtml = "";
    for (let ep of s.episodes) {
      episodesHtml += `<div class="episode-card" data-season="${s.season}" data-ep="${ep.episode}">
        <img src="${ep.thumbnail}" width="80" height="80" style="border-radius:12px">
        <div><strong>Episode ${ep.episode}: ${ep.title}</strong></div>
      </div>`;
    }
    seasonsHtml += `<div class="season-block"><h3>Season ${s.season}</h3><div class="episodes-list">${episodesHtml}</div></div>`;
  }
  container.innerHTML = `
    <div class="story-banner"><img src="${drama.banner}" style="width:100%; border-radius:28px"></div>
    <div class="story-info"><h1>${drama.title}</h1><p>${drama.description}</p><div>${drama.genres.map(g=>`<span class="chip">${g}</span>`).join('')}</div><p>Year: ${drama.year} | Status: ${drama.status}</p></div>
    <div class="seasons-wrapper">${seasonsHtml}</div>
  `;
  document.querySelectorAll(".episode-card").forEach(card => {
    card.addEventListener("click", () => {
      const season = card.dataset.season;
      const ep = card.dataset.ep;
      window.location.href = `episode.html?drama=${dramaId}&season=${season}&episode=${ep}`;
    });
  });
  document.getElementById("loader")?.remove();
}

loadDrama();
initThemeStory();
function initThemeStory() { 
  const dark = localStorage.getItem("dramavault_theme");
  if (dark === "dark") document.body.classList.add("dark");
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("dramavault_theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}
