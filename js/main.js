// DATA FETCH + GLOBAL STATE
let allStories = [];
let currentFilter = "All";
let favorites = JSON.parse(localStorage.getItem("dramavault_favs") || "[]");
let heroIndex = 0;
let heroInterval;

// DOM elements
const searchInput = document.getElementById("search-input");
const trendingGrid = document.getElementById("trending-grid");
const latestGrid = document.getElementById("latest-grid");
const popularGrid = document.getElementById("popular-grid");
const continueGrid = document.getElementById("continue-grid");
const favoritesGrid = document.getElementById("favorites-grid");
const continueSection = document.getElementById("continue-watching-section");
const favSection = document.getElementById("favorites-section");
const filterContainer = document.getElementById("filter-chips");
const heroTrack = document.getElementById("hero-track");

// Helper: load stories.json
async function loadStories() {
  const res = await fetch("data/stories.json");
  allStories = await res.json();
  renderFilters();
  renderAllSections();
  setupHeroSlider();
}

function renderFilters() {
  const categories = ["All", "Romance", "Comedy", "Fantasy", "Action", "Mystery", "Thriller", "School Life", "Historical"];
  filterContainer.innerHTML = categories.map(cat => `<div class="chip ${currentFilter === cat ? 'active' : ''}" data-category="${cat}">${cat}</div>`).join("");
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      currentFilter = chip.dataset.category;
      renderFilters();
      renderAllSections();
    });
  });
}

function getFilteredStories() {
  if (currentFilter === "All") return allStories;
  return allStories.filter(s => s.category === currentFilter);
}

function searchFilter(stories) {
  const term = searchInput.value.toLowerCase().trim();
  if (!term) return stories;
  return stories.filter(s => s.title.toLowerCase().includes(term) || s.category.toLowerCase().includes(term));
}

function renderAllSections() {
  let base = getFilteredStories();
  base = searchFilter(base);
  
  // Simulate trending/popular: just reorder for demo
  const trending = [...base].slice(0, 8);
  const latest = [...base].reverse().slice(0, 8);
  const popular = [...base].slice(0, 8);
  
  renderGrid(trendingGrid, trending);
  renderGrid(latestGrid, latest);
  renderGrid(popularGrid, popular);
  renderContinueWatching();
  renderFavorites();
}

function renderGrid(container, stories) {
  if (!container) return;
  container.innerHTML = stories.map(drama => `
    <div class="drama-card" data-id="${drama.id}">
      <img class="poster" src="${drama.poster}" alt="${drama.title}" loading="lazy">
      <div class="card-info">
        <h4>${drama.title}</h4>
        <span class="badge">${drama.category} • ${drama.status}</span>
        <div>
          <button class="fav-btn ${favorites.includes(drama.id) ? 'active' : ''}" data-id="${drama.id}"><i class="fas fa-heart"></i></button>
        </div>
      </div>
    </div>
  `).join("");
  
  // attach click events to cards
  document.querySelectorAll(".drama-card").forEach(card => {
    const id = card.dataset.id;
    card.addEventListener("click", (e) => {
      if (e.target.closest('.fav-btn')) return;
      window.location.href = `story.html?id=${id}`;
    });
    const btn = card.querySelector(".fav-btn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleFavorite(id);
      });
    }
  });
}

function toggleFavorite(id) {
  if (favorites.includes(id)) {
    favorites = favorites.filter(f => f !== id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem("dramavault_favs", JSON.stringify(favorites));
  renderAllSections();
}

function renderFavorites() {
  const favStories = allStories.filter(s => favorites.includes(s.id));
  if (favStories.length === 0) {
    favSection.style.display = "none";
    return;
  }
  favSection.style.display = "block";
  renderGrid(favoritesGrid, favStories);
}

function renderContinueWatching() {
  const visited = JSON.parse(localStorage.getItem("dramavault_continue") || "[]");
  if (visited.length === 0) {
    continueSection.style.display = "none";
    return;
  }
  const continueDramas = allStories.filter(s => visited.includes(s.id));
  if (continueDramas.length === 0) continueSection.style.display = "none";
  else {
    continueSection.style.display = "block";
    renderGrid(continueGrid, continueDramas);
  }
}

async function setupHeroSlider() {
  if (!allStories.length) return;
  const heroStories = allStories.slice(0, 5);
  heroTrack.innerHTML = heroStories.map(s => `
    <div class="hero-slide" style="background-image: linear-gradient(0deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2)), url('${s.poster}')">
      <div class="hero-content">
        <h2>${s.title}</h2>
        <p>${s.category} • ${s.year}</p>
        <button class="watch-now-btn" data-id="${s.id}">Watch Now</button>
      </div>
    </div>
  `).join("");
  document.querySelectorAll(".watch-now-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.dataset.id;
      window.location.href = `story.html?id=${id}`;
    });
  });
  startHeroAuto();
  document.getElementById("hero-prev")?.addEventListener("click", () => slideHero(-1));
  document.getElementById("hero-next")?.addEventListener("click", () => slideHero(1));
}

function slideHero(direction) {
  const slides = document.querySelectorAll(".hero-slide");
  if (!slides.length) return;
  heroIndex = (heroIndex + direction + slides.length) % slides.length;
  heroTrack.style.transform = `translateX(-${heroIndex * 100}%)`;
  resetHeroTimer();
}

function startHeroAuto() {
  if (heroInterval) clearInterval(heroInterval);
  heroInterval = setInterval(() => slideHero(1), 5000);
}
function resetHeroTimer() {
  if (heroInterval) clearInterval(heroInterval);
  heroInterval = setInterval(() => slideHero(1), 5000);
}

// Dark/light toggle
function initTheme() {
  const isDark = localStorage.getItem("dramavault_theme") === "dark";
  if (isDark) document.body.classList.add("dark");
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("dramavault_theme", document.body.classList.contains("dark") ? "dark" : "light");
  });
}

searchInput.addEventListener("input", () => renderAllSections());

window.addEventListener("load", async () => {
  await loadStories();
  initTheme();
  document.getElementById("global-loader")?.remove();
});
