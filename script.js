
let albums = JSON.parse(localStorage.getItem('albums')) || { Default: [] };
let currentAlbum = 'Default';

document.addEventListener('DOMContentLoaded', () => {
  updateAlbumSelect();
  loadAlbumThumbnails();
  loadGallery();
  document.getElementById('upload').addEventListener('change', handleUpload);
  playRandomMusic();
});

function playRandomMusic() {
  const tracks = ['default.mp3'];
  const track = tracks[Math.floor(Math.random() * tracks.length)];
  document.getElementById('bgMusic').src = 'music/' + track;
}

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
      loadAlbumThumbnails();
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

  photos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'photo-card';

    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.name;

    const caption = document.createElement('div');
    caption.className = 'caption';
    caption.textContent = photo.caption || '';
    caption.contentEditable = true;
    caption.addEventListener('blur', () => {
      albums[currentAlbum][index].caption = caption.textContent;
      saveData();
    });

    let pressTimer;
    img.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        const choice = prompt("What do you want to do?
1. Change caption
2. Delete photo
3. Move to album");
        if (choice === '1') {
          const newCaption = prompt("New caption:", photo.caption);
          if (newCaption !== null) {
            albums[currentAlbum][index].caption = newCaption;
            saveData();
            loadGallery();
          }
        } else if (choice === '2') {
          if (confirm("Delete this photo?")) {
            albums[currentAlbum].splice(index, 1);
            saveData();
            loadGallery();
            loadAlbumThumbnails();
          }
        } else if (choice === '3') {
          const targetAlbum = prompt("Move to which album?", currentAlbum);
          if (targetAlbum && targetAlbum !== currentAlbum && albums[targetAlbum]) {
            albums[targetAlbum].push(photo);
            albums[currentAlbum].splice(index, 1);
            saveData();
            loadGallery();
            loadAlbumThumbnails();
          }
        }
      }, 700);
    });
    img.addEventListener('mouseup', () => clearTimeout(pressTimer));
    img.addEventListener('mouseleave', () => clearTimeout(pressTimer));

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
    loadAlbumThumbnails();
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

function loadAlbumThumbnails() {
  let container = document.getElementById('albumThumbnails');
  if (!container) {
    container = document.createElement('div');
    container.id = 'albumThumbnails';
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.justifyContent = 'center';
    container.style.gap = '12px';
    document.body.insertBefore(container, document.querySelector('main'));
  }
  container.innerHTML = '';
  for (const name in albums) {
    const photos = albums[name];
    const wrapper = document.createElement('div');
    wrapper.style.cursor = 'pointer';
    wrapper.style.textAlign = 'center';

    const thumb = document.createElement('img');
    thumb.src = photos[0]?.src || 'https://via.placeholder.com/100x100?text=Empty';
    thumb.style.width = '100px';
    thumb.style.height = '100px';
    thumb.style.objectFit = 'cover';
    thumb.style.borderRadius = '10px';
    thumb.style.boxShadow = name === currentAlbum ? '0 0 0 4px hotpink' : '0 0 5px #ccc';

    const label = document.createElement('div');
    label.textContent = name;
    label.style.fontSize = '0.8rem';
    label.style.marginTop = '4px';

    let pressTimer;
    wrapper.addEventListener('mousedown', () => {
      pressTimer = setTimeout(() => {
        const choice = prompt(`Manage album "${name}":
1. Rename
2. Delete
3. Change thumbnail`);
        if (choice === '1') {
          const newName = prompt("Enter new album name:", name);
          if (newName && !albums[newName]) {
            albums[newName] = albums[name];
            delete albums[name];
            if (currentAlbum === name) currentAlbum = newName;
            saveData();
            updateAlbumSelect();
            loadGallery();
            loadAlbumThumbnails();
          }
        } else if (choice === '2') {
          if (confirm(`Delete album "${name}" and all its photos?`)) {
            delete albums[name];
            if (currentAlbum === name) currentAlbum = Object.keys(albums)[0] || 'Default';
            saveData();
            updateAlbumSelect();
            loadGallery();
            loadAlbumThumbnails();
          }
        } else if (choice === '3') {
          const imageUrl = prompt("Paste image URL to use as thumbnail:");
          if (imageUrl) {
            if (albums[name].length > 0) albums[name][0].src = imageUrl;
            saveData();
            loadAlbumThumbnails();
          }
        }
      }, 700);
    });
    wrapper.addEventListener('mouseup', () => clearTimeout(pressTimer));
    wrapper.addEventListener('mouseleave', () => clearTimeout(pressTimer));

    wrapper.onclick = () => {
      currentAlbum = name;
      updateAlbumSelect();
      loadGallery();
      loadAlbumThumbnails();
    };

    wrapper.appendChild(thumb);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  }
}

function changeAlbum(name) {
  currentAlbum = name;
  loadGallery();
  loadAlbumThumbnails();
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
  document.getElementById('musicName').textContent = `Now Playing: 🎧 ${file.name}`;
  const reader = new FileReader();
  reader.onload = () => {
    const audio = document.getElementById('bgMusic');
    audio.src = reader.result;
    audio.play();
  };
  reader.readAsDataURL(file);
}
