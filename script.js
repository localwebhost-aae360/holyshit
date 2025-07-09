let currentUser = localStorage.getItem('currentUser');
let albums = {};
let currentAlbum = 'Default';

document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) {
    document.getElementById('loginScreen').style.display = 'block';
  } else {
    initGallery();
  }
});

function login() {
  const name = document.getElementById('usernameInput').value.trim();
  if (!name) return alert("Please enter a name!");
  currentUser = name;
  localStorage.setItem('currentUser', name);
  initGallery();
}

function logout() {
  localStorage.removeItem('currentUser');
  location.reload();
}

function initGallery() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('userTitle').textContent = `${currentUser}'s Cute Gallery 🐰`;
  albums = JSON.parse(localStorage.getItem(currentUser + '_albums')) || { Default: [] };
  localStorage.setItem(currentUser + '_albums', JSON.stringify(albums));
  updateAlbumSelect();
  loadGallery();
  document.getElementById('upload').addEventListener('change', handleUpload);
  playSavedMusic();
}

function updateAlbumSelect() {
  const select = document.getElementById('albumSelect');
  select.innerHTML = '';
  for (const album in albums) {
    const opt = document.createElement('option');
    opt.value = album;
    opt.textContent = album;
    select.appendChild(opt);
  }
}

function changeAlbum(name) {
  currentAlbum = name;
  loadGallery();
}

function createAlbum() {
  const name = prompt("New album name:");
  if (!name) return;
  if (!albums[name]) albums[name] = [];
  localStorage.setItem(currentUser + '_albums', JSON.stringify(albums));
  updateAlbumSelect();
}

function handleUpload(e) {
  const files = Array.from(e.target.files);
  const readers = files.map(file => new Promise(res => {
    const reader = new FileReader();
    reader.onload = () => res({
      name: file.name,
      url: reader.result,
      caption: '',
      date: new Date().toISOString()
    });
    reader.readAsDataURL(file);
  }));
  Promise.all(readers).then(results => {
    albums[currentAlbum].push(...results);
    localStorage.setItem(currentUser + '_albums', JSON.stringify(albums));
    loadGallery();
  });
}

function loadGallery() {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  const photos = albums[currentAlbum] || [];
  photos.forEach((photo, index) => {
    const container = document.createElement('div');
    container.className = 'photo';
    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.name;
    img.onclick = () => editCaption(index);
    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = photo.caption || 'Tap to add caption';
    container.appendChild(img);
    container.appendChild(caption);
    gallery.appendChild(container);
  });
}

function editCaption(index) {
  const text = prompt("Enter caption:");
  if (text != null) {
    albums[currentAlbum][index].caption = text;
    localStorage.setItem(currentUser + '_albums', JSON.stringify(albums));
    loadGallery();
  }
}

function sortPhotos(type) {
  if (!albums[currentAlbum]) return;
  if (type === 'name') {
    albums[currentAlbum].sort((a, b) => a.name.localeCompare(b.name));
  } else {
    albums[currentAlbum].sort((a, b) => new Date(a.date) - new Date(b.date));
  }
  localStorage.setItem(currentUser + '_albums', JSON.stringify(albums));
  loadGallery();
}

function changeMusic(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('musicName').textContent = `🎧 ${file.name}`;
  const reader = new FileReader();
  reader.onload = () => {
    const audio = document.getElementById('bgMusic');
    audio.src = reader.result;
    audio.play();
    localStorage.setItem(currentUser + '_music', reader.result);
  };
  reader.readAsDataURL(file);
}

function playSavedMusic() {
  const music = localStorage.getItem(currentUser + '_music');
  if (music) {
    document.getElementById('bgMusic').src = music;
  }
}
