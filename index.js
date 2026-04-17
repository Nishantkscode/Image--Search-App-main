const accessKey = "RZEIOVfPhS7vMLkFdd2TSKGFBS4o9_FmcV1Nje3FSjw";

const formEl = document.getElementById("search-form");
const searchInputEl = document.getElementById("search-input");
const searchResultsEl = document.querySelector(".search-results");
const loaderEl = document.getElementById("loader");
const errorMessageEl = document.getElementById("error-message");
const themeToggleEl = document.getElementById("theme-toggle");
const favoritesContainerEl = document.getElementById("favorites-container");

const modalEl = document.getElementById("image-modal");
const modalImgEl = document.getElementById("modal-img");
const closeModalEl = document.getElementById("close-modal");

let inputData = "";
let page = 1;
let isLoading = false;
let hasMoreResults = true;

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

/* Save favorites */
function saveFavorites() {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

/* Render favorites */
function renderFavorites() {
  favoritesContainerEl.innerHTML = "";

  if (favorites.length === 0) {
    favoritesContainerEl.innerHTML = `<p class="empty-text">No favorites added yet.</p>`;
    return;
  }

  favorites.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("favorite-card");

    card.innerHTML = `
      <img src="${item.small}" alt="${item.alt}" />
      <div class="card-info">
        <p>${item.alt}</p>
      </div>
      <div class="overlay">
        <div class="overlay-left">
          <button class="overlay-btn preview-btn" title="Preview">
            <i class="fa-solid fa-expand"></i>
          </button>
          <button class="overlay-btn open-btn" title="Open on Unsplash">
            <i class="fa-solid fa-up-right-from-square"></i>
          </button>
        </div>
        <div class="overlay-right">
          <button class="overlay-btn remove-btn" title="Remove favorite">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;

    card.querySelector(".preview-btn").addEventListener("click", () => {
      openModal(item.regular);
    });

    card.querySelector(".open-btn").addEventListener("click", () => {
      window.open(item.link, "_blank");
    });

    card.querySelector(".remove-btn").addEventListener("click", () => {
      favorites.splice(index, 1);
      saveFavorites();
      renderFavorites();
    });

    favoritesContainerEl.appendChild(card);
  });
}

/* Prevent duplicate favorites */
function isAlreadyFavorite(link) {
  return favorites.some((item) => item.link === link);
}

/* Add to favorites */
function addToFavorites(imageData) {
  if (isAlreadyFavorite(imageData.link)) return;

  favorites.unshift(imageData);
  saveFavorites();
  renderFavorites();
}

/* Modal */
function openModal(imageUrl) {
  modalImgEl.src = imageUrl;
  modalEl.style.display = "flex";
}

/* Create image card */
function createImageCard(result) {
  const altText = result.alt_description || "Unsplash image";

  const imageWrapper = document.createElement("div");
  imageWrapper.classList.add("search-result");

  const image = document.createElement("img");
  image.src = result.urls.small;
  image.alt = altText;

  const cardInfo = document.createElement("div");
  cardInfo.classList.add("card-info");

  const caption = document.createElement("p");
  caption.textContent = altText;

  cardInfo.appendChild(caption);

  const overlay = document.createElement("div");
  overlay.classList.add("overlay");

  const overlayLeft = document.createElement("div");
  overlayLeft.classList.add("overlay-left");

  const overlayRight = document.createElement("div");
  overlayRight.classList.add("overlay-right");

  const previewBtn = document.createElement("button");
  previewBtn.className = "overlay-btn";
  previewBtn.innerHTML = `<i class="fa-solid fa-expand"></i>`;

  const openBtn = document.createElement("button");
  openBtn.className = "overlay-btn";
  openBtn.innerHTML = `<i class="fa-solid fa-up-right-from-square"></i>`;

  const downloadBtn = document.createElement("button");
  downloadBtn.className = "overlay-btn";
  downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i>`;

  const favoriteBtn = document.createElement("button");
  favoriteBtn.className = "overlay-btn";
  favoriteBtn.innerHTML = `<i class="fa-solid fa-heart"></i>`;

  previewBtn.addEventListener("click", () => openModal(result.urls.regular));

  openBtn.addEventListener("click", () => {
    window.open(result.links.html, "_blank");
  });

  downloadBtn.addEventListener("click", () => {
    window.open(result.links.download, "_blank");
  });

  favoriteBtn.addEventListener("click", () => {
    addToFavorites({
      small: result.urls.small,
      regular: result.urls.regular,
      alt: altText,
      link: result.links.html,
    });
  });

  image.addEventListener("click", () => openModal(result.urls.regular));

  overlayLeft.appendChild(previewBtn);
  overlayLeft.appendChild(openBtn);

  overlayRight.appendChild(downloadBtn);
  overlayRight.appendChild(favoriteBtn);

  overlay.appendChild(overlayLeft);
  overlay.appendChild(overlayRight);

  imageWrapper.appendChild(image);
  imageWrapper.appendChild(cardInfo);
  imageWrapper.appendChild(overlay);

  searchResultsEl.appendChild(imageWrapper);
}

/* Main search function */
async function searchImages() {
  inputData = searchInputEl.value.trim();

  if (!inputData || isLoading || !hasMoreResults) return;

  try {
    isLoading = true;
    loaderEl.style.display = "block";
    errorMessageEl.textContent = "";

    const url = `https://api.unsplash.com/search/photos?page=${page}&query=${inputData}&client_id=${accessKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch images");
    }

    const data = await response.json();

    if (page === 1) {
      searchResultsEl.innerHTML = "";
    }

    const results = data.results;

    if (results.length === 0 && page === 1) {
      errorMessageEl.textContent = "No results found.";
      hasMoreResults = false;
      return;
    }

    if (results.length === 0) {
      hasMoreResults = false;
      return;
    }

    results.forEach(createImageCard);
    page++;
  } catch (error) {
    errorMessageEl.textContent = "Something went wrong.";
  } finally {
    isLoading = false;
    loaderEl.style.display = "none";
  }
}

/* Events */
formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  page = 1;
  hasMoreResults = true;
  searchImages();
});

window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300
  ) {
    searchImages();
  }
});

/* Dark mode */
themeToggleEl.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

/* Modal close */
closeModalEl.addEventListener("click", () => {
  modalEl.style.display = "none";
});

/* Init */
renderFavorites();