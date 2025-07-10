// script.js - Handles gallery logic

let currentUser = localStorage.getItem('gallery_user');
let albums = {};
let currentAlbum = 'Default';

const appScreen = document.getElementById('gallery-app');
const loginScreen = document.getElementById('login-screen');

const galleryTitle = document.getElementById('gallery-title');
const albumSelector = document.getElementById('album-selector');
const photoGallery = document.getElementById('photo-gallery');
const photoUpload = document.getElementById('photo-upload');
const bgMusic = document.getElementById('bg-music');

function login() {
  const username = document.getElementById('username').value.trim();
  if (!username) return alert("Enter your username");
  currentUser = username;
  localStorage.setItem('gallery_user', username);
  loadUserData();
  showGallery();
}

function logout() {
  localStorage.removeItem('gallery_user');
  location.reload();
}

function showGallery() {
  loginScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  galleryTitle.textContent = `${currentUser}'s Cute Gallery 💕`;
  renderAlbums();
  renderPhotos();
  playSavedMusic();
}

function loadUserData() {
  albums = JSON.parse(localStorage.getItem(currentUser + '_albums')) || { Default: [] };
  currentAlbum = Object.keys(albums)[0] || 'Default';
  saveUserData();
}

function saveUserData() {
  localStorage.setItem(currentUser + '_albums', JSON.stringify(albums));
}

function renderAlbums() {
  albumSelector.innerHTML = '';
  Object.keys(albums).forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    albumSelector.appendChild(opt);
  });
  albumSelector.value = currentAlbum;
}

function switchAlbum(name) {
  currentAlbum = name;
  renderPhotos();
}

function createAlbum() {
  const name = prompt("Album name:");
  if (name && !albums[name]) {
    albums[name] = [];
    currentAlbum = name;
    saveUserData();
    renderAlbums();
    renderPhotos();
  }
}

photoUpload.addEventListener('change', () => {
  const files = Array.from(photoUpload.files);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = () => {
      albums[currentAlbum].push({
        name: file.name,
        url: reader.result,
        caption: '',
        date: new Date().toISOString()
      });
      saveUserData();
      renderPhotos();
    };
    reader.readAsDataURL(file);
  });
});

function renderPhotos() {
  photoGallery.innerHTML = '';
  albums[currentAlbum].forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'photo-card';

    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.name;
    img.addEventListener('click', () => editCaption(index));
    img.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showPhotoOptions(index);
    });

    const cap = document.createElement('div');
    cap.className = 'caption';
    cap.textContent = photo.caption || 'Tap to add caption';

    card.appendChild(img);
    card.appendChild(cap);
    photoGallery.appendChild(card);
  });
}

function editCaption(index) {
  const newCap = prompt("Edit caption:", albums[currentAlbum][index].caption);
  if (newCap !== null) {
    albums[currentAlbum][index].caption = newCap;
    saveUserData();
    renderPhotos();
  }
}

function showPhotoOptions(index) {
  const choice = prompt("Options: delete, move, caption");
  if (!choice) return;
  if (choice === 'delete') {
    if (confirm("Delete this photo?")) {
      albums[currentAlbum].splice(index, 1);
      saveUserData();
      renderPhotos();
    }
  } else if (choice === 'move') {
    const toAlbum = prompt("Move to which album?");
    if (toAlbum && albums[toAlbum]) {
      albums[toAlbum].push(albums[currentAlbum][index]);
      albums[currentAlbum].splice(index, 1);
      saveUserData();
      renderPhotos();
    }
  } else if (choice === 'caption') {
    editCaption(index);
  }
}

function uploadMusic() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      localStorage.setItem(currentUser + '_music', reader.result);
      playSavedMusic();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function playSavedMusic() {
  const music = localStorage.getItem(currentUser + '_music');
  if (music) {
    bgMusic.src = music;
    bgMusic.play();
  }
}

if (currentUser) {
  loadUserData();
  showGallery();
}
