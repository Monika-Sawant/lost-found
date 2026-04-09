const API_URL = "http://localhost:5000/api";

// Elements
const authLink = document.getElementById("auth-link");
const logoutBtn = document.getElementById("logout-btn");
const loginSection = document.getElementById("login");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const reportForm = document.getElementById("report-form");

// Auth State
let authToken = localStorage.getItem("token");
let currentUser = localStorage.getItem("userEmail");

// Initialize
window.onload = () => {
  loginSection.style.display = "none"; // start hidden
  checkAuth();
  loadItems();
  loadLeaderboard();
};

function checkAuth() {
  if (authToken) {
    authLink.style.display = "none";
    logoutBtn.style.display = "inline";
    loginSection.style.display = "none";
  } else {
    authLink.style.display = "inline";
    logoutBtn.style.display = "none";
  }
}

// Show/Hide login section when clicking login link
authLink.addEventListener("click", (e) => {
  e.preventDefault();
  loginSection.style.display = loginSection.style.display === "none" ? "flex" : "none";
});

// Logout
logoutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  authToken = null;
  currentUser = null;
  checkAuth();
  alert("Logged out successfully");
});

// Auth Submit
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  
  await authenticate("login", { email, password });
});

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("reg-name").value;
  const description = document.getElementById("reg-desc").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  
  await authenticate("register", { name, description, email, password });
});

async function authenticate(type, payload) {
  try {
    const res = await fetch(`${API_URL}/auth/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", data.email);
      authToken = data.token;
      currentUser = data.email;
      checkAuth();
      if(type === 'login') loginForm.reset();
      if(type === 'register') registerForm.reset();
      alert(`${type === 'login' ? 'Logged in' : 'Registered'} successfully!`);
    } else {
      alert(data.message || "Authentication failed");
    }
  } catch (err) {
    console.error(err);
    alert("Network Error authenticating: Make sure the server is running on port 5000!");
  }
}

// Handle form submit (Report)
reportForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!authToken) {
    alert("You must be logged in to report an item!");
    return;
  }

  const title = document.getElementById("item-title").value;
  const desc = document.getElementById("item-desc").value;
  const detailsRaw = document.getElementById("item-details").value;
  const location = document.getElementById("item-location").value;
  const category = document.getElementById("item-category").value;

  const detailsArray = detailsRaw ? detailsRaw.split(",").map(d => d.trim()) : [];

  try {
    const res = await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title,
        description: desc,
        details: detailsArray,
        location,
        category
      })
    });

    if (res.ok) {
      alert("Item reported successfully!");
      reportForm.reset();
      loadItems();
    } else {
      const data = await res.json();
      alert("Error reporting item: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Error reporting item: Check network");
  }
});

// Load lost & found items
async function loadItems() {
  try {
    const res = await fetch(`${API_URL}/items`);
    const items = await res.json();

    const lostContainer = document.querySelector("#lost .card-container");
    const foundContainer = document.querySelector("#found .card-container");
    const resolveSelect = document.getElementById("resolve-item-select");

    lostContainer.innerHTML = "";
    foundContainer.innerHTML = "";
    resolveSelect.innerHTML = '<option value="">-- Select an Open Item --</option>';

    items.forEach(item => {
      // Setup dynamic select for Resolve section
      resolveSelect.innerHTML += `<option value="${item._id}">${item.title} (${item.category.toUpperCase()}) - ${item.location}</option>`;

      // Build details list
      let detailsHtml = "";
      if (item.details && item.details.length > 0) {
        detailsHtml = `<ul style="text-align: left; padding: 0 20px 20px 40px; color: #7d8697; font-size: 0.9em;">
          ${item.details.map(d => `<li>${d}</li>`).join("")}
        </ul>`;
      }

      const card = `
        <div class="card">
          <h3>${item.title}</h3>
          <p style="font-weight: bold;">${item.description || "No description"}</p>
          ${detailsHtml}
          <p>📍 ${item.location}</p>
        </div>
      `;

      if (item.category === "lost") {
        lostContainer.innerHTML += card;
      } else {
        foundContainer.innerHTML += card;
      }
    });
  } catch (err) {
    console.error("Failed to load items", err);
  }
}

// Resolve an Item via new Form
const resolveForm = document.getElementById("resolve-form");
if(resolveForm) {
  resolveForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!authToken) {
      alert("You must be logged in to resolve items!");
      return;
    }

    const itemId = document.getElementById("resolve-item-select").value;
    const resolverName = document.getElementById("resolve-name").value;
    
    if (!itemId) {
      alert("Please select an item first!");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/items/${itemId}/resolve`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ resolverName })
      });

      if (res.ok) {
        alert("Item resolved successfully! Your score increased by +1!");
        resolveForm.reset();
        loadItems(); // refresh list & dropdown
        loadLeaderboard(); // refresh leaderboard
      } else {
        const data = await res.json();
        alert("Error resolving item: " + data.message);
      }
    } catch(err) {
      console.error(err);
      alert("Error resolving item (Network Error).");
    }
  });
}

// Load Leaderboard
async function loadLeaderboard() {
  try {
    const res = await fetch(`${API_URL}/users/leaderboard`);
    const users = await res.json();

    const lbContainer = document.getElementById("leaderboard-container");
    lbContainer.innerHTML = "";

    users.forEach((u, index) => {
      // Create a nice card for users
      const card = `
        <div class="card" style="padding: 20px; background: linear-gradient(135deg, #fff, #fef3c7);">
          <h1 style="font-size: 2rem; color: #d97706;">#${index + 1}</h1>
          <h3 style="padding: 10px;">${u.name || (u.email ? u.email.split('@')[0] : 'Hero')}</h3>
          <p style="font-size: 1rem; color: #6b7280; font-style: italic; margin-bottom: 10px;">"${u.description || 'Student'}"</p>
          <p style="font-size: 1.2rem; font-weight: bold; color: #4f46e5;">Points: ${u.score}</p>
        </div>
      `;
      lbContainer.innerHTML += card;
    });
  } catch (err) {
    console.error("Failed to load leaderboard", err);
  }
}
