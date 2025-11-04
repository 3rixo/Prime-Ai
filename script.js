// ===============================
// CONFIGURATION
// ===============================
const BASE_URL = "http://10.88.0.3:8080"; // ⚠️ Change this later to your Google Cloud backend URL

// ===============================
// DOM ELEMENTS
// ===============================
const tableBody = document.querySelector("#reelTable tbody");
const modal = document.getElementById("modal");
const form = document.getElementById("reelForm");
const searchInput = document.getElementById("search");

let reels = []; // Cached data from backend

// ===============================
// INITIAL LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  fetchReels();
});

// ===============================
// FETCH ALL REELS FROM BACKEND
// ===============================
async function fetchReels() {
  try {
    const res = await fetch(`${BASE_URL}/reels`);
    reels = await res.json();
    renderTable(reels);
    updateStats();
  } catch (err) {
    console.error("Error fetching reels:", err);
  }
}

// ===============================
// RENDER TABLE
// ===============================
function renderTable(data) {
  tableBody.innerHTML = "";

  if (!data.length) {
    tableBody.innerHTML = `<tr><td colspan="5">No reels found</td></tr>`;
    return;
  }

  data.forEach((reel) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td><a href="${reel.reel_link}" target="_blank">${reel.reel_link}</a></td>
      <td>${reel.comment_keyword}</td>
      <td>${reel.reward || "-"}</td>
      <td>
        <button onclick="toggleStatus(${reel.id}, '${reel.status}')"
                class="${reel.status === 'active' ? 'active-btn' : 'inactive-btn'}">
          ${reel.status}
        </button>
      </td>
      <td>
        <button class="delete-btn" onclick="deleteReel(${reel.id})">🗑️ Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// ===============================
// ADD NEW REEL
// ===============================
async function addReel(event) {
  event.preventDefault();

  const newReel = {
    reel_link: document.getElementById("reelLink").value.trim(),
    comment_keyword: document.getElementById("commentKeyword").value.trim(),
    reward: document.getElementById("rewardLink").value.trim(),
  };

  try {
    const res = await fetch(`${BASE_URL}/add_reel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReel),
    });

    if (!res.ok) throw new Error("Failed to add reel");

    closeModal();
    fetchReels();
    form.reset();
  } catch (err) {
    console.error("Error adding reel:", err);
  }
}

// ===============================
// DELETE REEL
// ===============================
async function deleteReel(id) {
  if (!confirm("Are you sure you want to delete this reel?")) return;

  try {
    const res = await fetch(`${BASE_URL}/delete_reel/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete reel");

    fetchReels();
  } catch (err) {
    console.error("Error deleting reel:", err);
  }
}

// ===============================
// TOGGLE REEL STATUS
// ===============================
async function toggleStatus(id, currentStatus) {
  const newStatus = currentStatus === "active" ? "inactive" : "active";

  try {
    const res = await fetch(`${BASE_URL}/update_status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!res.ok) throw new Error("Failed to update status");

    fetchReels();
  } catch (err) {
    console.error("Error updating status:", err);
  }
}

// ===============================
// SEARCH FUNCTIONALITY
// ===============================
searchInput.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = reels.filter(
    (r) =>
      r.reel_link.toLowerCase().includes(query) ||
      r.comment_keyword.toLowerCase().includes(query) ||
      (r.reward && r.reward.toLowerCase().includes(query))
  );
  renderTable(filtered);
});

// ===============================
// UPDATE STATS
// ===============================
function updateStats() {
  const total = reels.length;
  const active = reels.filter((r) => r.status === "active").length;
  const inactive = total - active;
  const withRewards = reels.filter((r) => r.reward && r.reward !== "").length;

  document.getElementById("totalReels").textContent = total;
  document.getElementById("activeReels").textContent = active;
  document.getElementById("inactiveReels").textContent = inactive;
  document.getElementById("rewardsCount").textContent = withRewards;
}

// ===============================
// MODAL CONTROL
// ===============================
function openModal() {
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}
