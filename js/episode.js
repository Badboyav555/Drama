const urlParams = new URLSearchParams(location.search);
const dramaId = urlParams.get("drama");
const season = parseInt(urlParams.get("season"));
const episodeNum = parseInt(urlParams.get("episode"));
let dramaData, episodesList, currentIndex;

async function initEpisode() {
  const res = await fetch(`data/dramas/${dramaId}.json`);
  dramaData = await res.json();
  const seasonData = dramaData.seasons.find(s => s.season === season);
  episodesList = seasonData.episodes;
  currentIndex = episodesList.findIndex(e => e.episode === episodeNum);
  const ep = episodesList[currentIndex];
  const visitedKey = `dramavault_continue`;
  let cont = JSON.parse(localStorage.getItem(visitedKey) || "[]");
  if (!cont.includes(dramaId)) cont.push(dramaId);
  localStorage.setItem(visitedKey, JSON.stringify(cont));

  const container = document.getElementById("episode-player");
  container.innerHTML = `
    <h2>${dramaData.title} - S${season} E${ep.episode}: ${ep.title}</h2>
    <div class="video-container" style="background:#000; border-radius:28px; padding:20px; text-align:center">
      <div id="video-guard" style="padding:40px; background:#111; border-radius:24px">
        <button id="unlock-btn" style="background:#e83e6f; padding:12px 28px; border-radius:40px; border:none; color:white; font-weight:bold">Continue To Watch</button>
      </div>
      <div id="player-embed" style="display:none"></div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top: 1.5rem">
      <button id="prev-ep" ${currentIndex===0 ? 'disabled' : ''}>◀ Previous Episode</button>
      <button id="next-ep" ${currentIndex===episodesList.length-1 ? 'disabled' : ''}>Next Episode ▶</button>
    </div>
  `;
  const unlockBtn = document.getElementById("unlock-btn");
  const guardDiv = document.getElementById("video-guard");
  const playerDiv = document.getElementById("player-embed");
  const check = localStorage.getItem(`supportVisited_${dramaId}_${season}_${episodeNum}`);
  if (check === "true") {
    unlockBtn.innerText = "Play Episode";
  }
  unlockBtn.onclick = () => {
    if (localStorage.getItem(`supportVisited_${dramaId}_${season}_${episodeNum}`) === "true") {
      playerDiv.style.display = "block";
      playerDiv.innerHTML = `<iframe width="100%" height="400" src="${ep.video}" frameborder="0" allowfullscreen></iframe>`;
      guardDiv.style.display = "none";
    } else {
      window.open(ep.video, "_blank");
      localStorage.setItem(`supportVisited_${dramaId}_${season}_${episodeNum}`, "true");
      unlockBtn.innerText = "Play Episode";
    }
  };
  document.getElementById("prev-ep")?.addEventListener("click", () => {
    const prevEp = episodesList[currentIndex-1];
    location.href = `episode.html?drama=${dramaId}&season=${season}&episode=${prevEp.episode}`;
  });
  document.getElementById("next-ep")?.addEventListener("click", () => {
    const nextEp = episodesList[currentIndex+1];
    location.href = `episode.html?drama=${dramaId}&season=${season}&episode=${nextEp.episode}`;
  });
}
initEpisode();
