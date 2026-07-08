// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Gallery (stored locally in the visitor's browser) ----------
const STORAGE_KEY = "monaStudioGallery";
const grid = document.getElementById("gallery-grid");
const emptyMsg = document.getElementById("gallery-empty");
const uploadInput = document.getElementById("gallery-upload");
const clearBtn = document.getElementById("gallery-clear");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxClose = document.getElementById("lightbox-close");

function loadPhotos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function savePhotos(photos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
}

function renderGallery() {
  const photos = loadPhotos();
  grid.querySelectorAll(".gallery-item").forEach((el) => el.remove());

  if (photos.length === 0) {
    emptyMsg.style.display = "block";
    return;
  }
  emptyMsg.style.display = "none";

  photos.forEach((photo) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    item.innerHTML = `
      <img src="${photo.data}" alt="${photo.name || "Studio photo"}" />
      <button class="remove-btn" aria-label="Remove photo" data-id="${photo.id}">&times;</button>
    `;
    item.querySelector("img").addEventListener("click", () => openLightbox(photo.data));
    item.querySelector(".remove-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      removePhoto(photo.id);
    });
    grid.appendChild(item);
  });
}

function addPhotos(fileList) {
  const photos = loadPhotos();
  const files = Array.from(fileList);
  let remaining = files.length;

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      photos.push({
        id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
        name: file.name,
        data: e.target.result,
      });
      remaining -= 1;
      if (remaining === 0) {
        savePhotos(photos);
        renderGallery();
      }
    };
    reader.readAsDataURL(file);
  });
}

function removePhoto(id) {
  const photos = loadPhotos().filter((p) => p.id !== id);
  savePhotos(photos);
  renderGallery();
}

uploadInput.addEventListener("change", (e) => {
  if (e.target.files && e.target.files.length) {
    addPhotos(e.target.files);
    e.target.value = "";
  }
});

clearBtn.addEventListener("click", () => {
  if (confirm("Remove all photos from the gallery?")) {
    savePhotos([]);
    renderGallery();
  }
});

function openLightbox(src) {
  lightboxImg.src = src;
  lightbox.classList.add("open");
}
function closeLightbox() {
  lightbox.classList.remove("open");
  lightboxImg.src = "";
}
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

renderGallery();
