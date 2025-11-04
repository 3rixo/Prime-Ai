// Temporary in-memory data (later replaced by Python + SQLite)
let reels = JSON.parse(localStorage.getItem('reels') || '[]');

function saveToStorage() {
  localStorage.setItem('reels', JSON.stringify(reels));
}

function updateStats() {
  document.getElementById('totalReels').textContent = reels.length;
  document.getElementById('activeReels').textContent = reels.filter(r => r.enabled).length;
  document.getElementById('inactiveReels').textContent = reels.filter(r => !r.enabled).length;
  document.getElementById('rewardsCount').textContent = reels.filter(r => r.reward).length;
}

function openModal() {
  document.getElementById('modal').classList.add('active');
  document.getElementById('reelForm').reset();
}

function closeModal() {
  document.getElementById('modal').classList.remove('active');
}

function addReel(e) {
  e.preventDefault();
  const link = document.getElementById('reelLink').value;
  const comment = document.getElementById('commentKeyword').value;
  const reward = document.getElementById('rewardLink').value;

  reels.unshift({ 
    link, 
    comment: comment.toUpperCase(), 
    reward, 
    enabled: true,
    id: Date.now()
  });
  
  saveToStorage();
  renderTable();
  updateStats();
  closeModal();
}

function deleteReel(id) {
  if (confirm("Are you sure you want to delete this reel?")) {
    reels = reels.filter(r => r.id !== id);
    saveToStorage();
    renderTable();
    updateStats();
  }
}

function toggleEnable(id) {
  const reel = reels.find(r => r.id === id);
  if (reel) {
    reel.enabled = !reel.enabled;
    saveToStorage();
    renderTable();
    updateStats();
  }
}

function renderTable() {
  const tableBody = document.querySelector("#reelTable tbody");
  const search = document.getElementById("search").value.toLowerCase();
  
  const filtered = reels.filter(r => 
    r.link.toLowerCase().includes(search) ||
    r.comment.toLowerCase().includes(search) ||
    (r.reward && r.reward.toLowerCase().includes(search))
  );

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <h3>${search ? 'No results found' : 'No reels yet'}</h3>
            <p>${search ? 'Try a different search term' : 'Click "Add Reel" to get started'}</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(r => `
    <tr>
      <td>
        <a href="${r.link}" target="_blank" class="reel-link" title="${r.link}">
          ${r.link}
        </a>
      </td>
      <td>
        <span class="keyword">${r.comment}</span>
      </td>
      <td>
        <span class="reward">${r.reward || '-'}</span>
      </td>
      <td>
        <button 
          class="toggle-btn ${r.enabled ? 'on' : 'off'}" 
          onclick="toggleEnable(${r.id})">
          ${r.enabled ? 'ON' : 'OFF'}
        </button>
      </td>
      <td>
        <button class="delete-btn" onclick="deleteReel(${r.id})">🗑</button>
      </td>
    </tr>
  `).join('');
}

// Event listeners
document.getElementById("search").addEventListener("input", renderTable);

document.getElementById('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') {
    closeModal();
  }
});

// Initialize on page load
renderTable();
updateStats();
