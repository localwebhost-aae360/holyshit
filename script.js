let albums = JSON.parse(localStorage.getItem('albums')) || { Default: [] };
let currentAlbum = 'Default';

document.addEventListener('DOMContentLoaded', () => {
  updateAlbumSelect();
  loadGallery();
  document.getElementById('upload').addEventListener('change', handleUpload);
  document.getElementById('bgMusic').src = 'music/default.mp3';
});

function handleUpload(e) {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    const caption = prompt(`Add a caption for ${file.name} (optional):`) || "";
    const reader = new FileReader();
    reader.onload = (evt) => {
      albums[currentAlbum].push({
        name: file.name,
        caption: caption,
        src: evt.target.result,
        date: new Date().toISOString()
      });
      saveData();
      loadGallery();
    };
    reader.readAsDataURL(file);
  });
}

function loadGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  let photos = albums[currentAlbum];

  const sortValue = document.getElementById('sortSelect').value;
  if (sortValue === 'name') {
    photos = [...photos].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    photos = [...photos].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  photos.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'photo-card';

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.name;

    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = photo.caption || '';

    card.appendChild(img);
    card.appendChild(caption);
    gallery.appendChild(card);
  });
}

function createAlbum() {
  const name = prompt("Enter new album name:");
  if (name && !albums[name]) {
    albums[name] = [];
    currentAlbum = name;
    saveData();
    updateAlbumSelect();
    loadGallery();
  }
}

function updateAlbumSelect() {
  const select = document.getElementById('albumSelect');
  select.innerHTML = '';
  for (const album in albums) {
    const option = document.createElement('option');
    option.value = album;
    option.textContent = album;
    if (album === currentAlbum) option.selected = true;
    select.appendChild(option);
  }
}

function changeAlbum(name) {
  currentAlbum = name;
  loadGallery();
}

function sortPhotos() {
  loadGallery();
}

function saveData() {
  localStorage.setItem('albums', JSON.stringify(albums));
}

function changeMusic(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const audio = document.getElementById('bgMusic');
    audio.src = reader.result;
    audio.play();
  };
  reader.readAsDataURL(file);
}
