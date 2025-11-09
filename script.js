// ===== GLOBALS =====
let cardBg = '';
let editingIndex = null;
let postsData = JSON.parse(localStorage.getItem("postsData")) || [];

const nameInput = document.getElementById("name");
const titleInput = document.getElementById("title");
const descInput = document.getElementById("description");
const uploadInput = document.getElementById("uploadImage");
const posts = document.getElementById("posts");

// ===== LOAD POSTS =====
window.onload = () => postsData.forEach(p => renderPost(p));

// ===== SELECT BACKGROUND IMAGE =====
function selectImg(src, event) {
  cardBg = src;
  document.querySelectorAll(".bgImg").forEach(img => img.classList.remove("selectedImg"));
  event.target.classList.add("selectedImg");
}

// ===== ADD OR UPDATE POST =====
function post() {
  const name = nameInput.value.trim() || "Anonymous";
  const title = titleInput.value.trim();
  const description = descInput.value.trim();
  const upload = uploadInput.files[0];

  if (!title || !description) {
    Swal.fire({
      icon: 'error',
      title: 'Empty Fields!',
      text: 'Please enter title and description',
      background: 'linear-gradient(135deg,#fff0f0,#ffe6e6)',
      color: '#d81b60',
      confirmButtonColor: '#f48fb1'
    });
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const postObj = {
      name, title, description,
      bg: cardBg,
      img: e.target.result || '',
      likes: 0,
      dislikes: 0
    };

    if (editingIndex !== null) {
      const oldPost = postsData[editingIndex];
      const same = (
        oldPost.name === postObj.name &&
        oldPost.title === postObj.title &&
        oldPost.description === postObj.description &&
        oldPost.bg === postObj.bg &&
        oldPost.img === postObj.img
      );

      if (same) {
        Swal.fire({
          icon: 'warning',
          title: 'No changes made!',
          text: 'Please modify something before updating.',
          background: 'linear-gradient(135deg,#fff0f5,#ffe4e9)',
          color: '#d81b60',
          confirmButtonColor: '#f48fb1'
        });
        return;
      }

      postsData[editingIndex] = postObj;
      editingIndex = null;

      Swal.fire({
        icon: 'success',
        title: '✅ Post Updated!',
        timer: 1200,
        showConfirmButton: false,
        background: 'linear-gradient(135deg,#fff0f5,#ffe4e9)',
        color: '#d81b60'
      });
    } else {
      postsData.push(postObj);
      Swal.fire({
        icon: 'success',
        title: '✨ Post Added!',
        timer: 1200,
        showConfirmButton: false,
        background: 'linear-gradient(135deg,#fff0f5,#ffe4e9)',
        color: '#d81b60'
      });
    }

    localStorage.setItem("postsData", JSON.stringify(postsData));
    refreshPosts();
    resetForm();
  };

  if (upload) reader.readAsDataURL(upload);
  else reader.onload({ target: { result: '' } });
}

// ===== RENDER ALL POSTS =====
function refreshPosts() {
  posts.innerHTML = '';
  postsData.forEach(renderPost);
}

// ===== RENDER ONE POST =====
function renderPost(post) {
  const card = document.createElement("div");
  card.className = "card-post";

  card.innerHTML = `
    <div class="card-body" style="${post.bg ? `background-image:url(${post.bg});background-size:cover;background-position:center;` : ''}">
      ${post.img ? `<img src="${post.img}">` : ''}
      <h5>${post.title}</h5>
      <div class="posted-by">Posted by <b>${post.name}</b></div>
      <p class="post-desc">${post.description}</p>
      <div class="card-actions">
        <div class="action-group">
          <button class="small-btn" onclick="likePost(this)"><span class="icon">❤️</span><span>${post.likes}</span></button>
          <button class="small-btn" onclick="dislikePost(this)"><span class="icon">💔</span><span>${post.dislikes}</span></button>
        </div>
        <div class="action-group">
          <button class="small-btn" onclick="editPost(this)"><span class="icon">✏️</span></button>
          <button class="small-btn" onclick="deletePost(this)"><span class="icon">🗑️</span></button>
        </div>
      </div>
    </div>
  `;

  const desc = card.querySelector(".post-desc");
  const fullText = desc.textContent.trim();
  if (fullText.length > 120) {
    const shortText = fullText.slice(0, 120) + "...";
    desc.textContent = shortText;

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "view-toggle";
    toggleBtn.textContent = "View more";

    toggleBtn.addEventListener("click", () => {
      const expanded = desc.classList.toggle("expanded");
      desc.textContent = expanded ? fullText : shortText;
      toggleBtn.textContent = expanded ? "View less" : "View more";

      const targetY = card.getBoundingClientRect().top + window.scrollY - 80;
      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = 700;
      let startTime = null;

      function smoothScroll(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startY + distance * ease);
        if (progress < 1) requestAnimationFrame(smoothScroll);
      }
      requestAnimationFrame(smoothScroll);
    });
    desc.insertAdjacentElement("afterend", toggleBtn);
  }

  posts.prepend(card);
}

// ===== EDIT POST =====
function editPost(btn) {
  const card = btn.closest(".card-post");
  const index = postsData.length - Array.from(card.parentNode.children).indexOf(card) - 1;
  const post = postsData[index];
  editingIndex = index;

  nameInput.value = post.name;
  titleInput.value = post.title;
  descInput.value = post.description;
  cardBg = post.bg || '';

  document.querySelectorAll(".bgImg").forEach(img =>
    img.classList.toggle("selectedImg", img.src === cardBg)
  );

  document.getElementById("postBtn").innerText = "Update Post";
}

// ===== DELETE POST =====
function deletePost(btn) {
  const card = btn.closest(".card-post");
  const index = Array.from(card.parentNode.children).indexOf(card);
  const post = postsData[postsData.length - index - 1];

  Swal.fire({
    title: 'Delete this post?',
    text: `"${post.title}" will be removed permanently.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    background: 'linear-gradient(135deg,#fff0f5,#ffe4e9)',
    color: '#d81b60',
    confirmButtonColor: '#f48fb1',
    cancelButtonColor: '#f8bbd0'
  }).then(result => {
    if (result.isConfirmed) {
      postsData.splice(postsData.length - index - 1, 1);
      localStorage.setItem("postsData", JSON.stringify(postsData));
      card.remove();
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Your post has been removed.',
        timer: 1200,
        showConfirmButton: false,
        background: 'linear-gradient(135deg,#fff0f5,#ffe4e9)',
        color: '#d81b60'
      });
    }
  });
}

// ===== LIKE / DISLIKE =====
function likePost(btn) {
  const card = btn.closest(".card-post");
  const index = Array.from(card.parentNode.children).indexOf(card);
  const post = postsData[postsData.length - index - 1];
  post.likes++;
  btn.querySelector("span:last-child").textContent = post.likes;
  localStorage.setItem("postsData", JSON.stringify(postsData));
}

function dislikePost(btn) {
  const card = btn.closest(".card-post");
  const index = Array.from(card.parentNode.children).indexOf(card);
  const post = postsData[postsData.length - index - 1];
  post.dislikes++;
  btn.querySelector("span:last-child").textContent = post.dislikes;
  localStorage.setItem("postsData", JSON.stringify(postsData));
}

// ===== RESET FORM =====
function resetForm() {
  nameInput.value = '';
  titleInput.value = '';
  descInput.value = '';
  uploadInput.value = '';
  cardBg = '';
  document.querySelectorAll(".bgImg").forEach(i => i.classList.remove("selectedImg"));
  document.getElementById("postBtn").innerText = "Add Post";
}

// ===== ENTER & DELETE KEYS =====
["name", "title", "description", "uploadImage"].forEach(id => {
  document.getElementById(id).addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      post();
    }
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "Delete") {
    const hoveredCard = document.querySelector(".card-post:hover");
    if (hoveredCard) {
      const deleteBtn = hoveredCard.querySelector(".small-btn:last-child");
      if (deleteBtn) deletePost(deleteBtn);
    }
  }
});

