const API_URL = "http://localhost:5000/api/items";

// Load items on page load
window.onload = () => {
  loadItems();
};

// Handle form submit
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target[0].value;
  const location = e.target[1].value;
  const category = e.target[2].value.toLowerCase();

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: name,
        location: location,
        category: category
      })
    });

    alert("Item reported successfully!");
    e.target.reset();
    loadItems();
  } catch (err) {
    alert("Error reporting item");
  }
});

// Load lost & found items
async function loadItems() {
  const res = await fetch(API_URL);
  const items = await res.json();

  const lostContainer = document.querySelector("#lost .card-container");
  const foundContainer = document.querySelector("#found .card-container");

  lostContainer.innerHTML = "";
  foundContainer.innerHTML = "";

  items.forEach(item => {
    const card = `
      <div class="card">
        <h3>${item.title}</h3>
        <p>${item.location}</p>
      </div>
    `;

    if (item.category === "lost") {
      lostContainer.innerHTML += card;
    } else {
      foundContainer.innerHTML += card;
    }
  });
}
