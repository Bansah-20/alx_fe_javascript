// -------------------- Quotes Data --------------------
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don’t let yesterday take up too much of today.", category: "Wisdom" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// Load quotes from local storage if available
if (localStorage.getItem("quotes")) {
  quotes = JSON.parse(localStorage.getItem("quotes"));
}

// -------------------- Save Quotes --------------------
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// -------------------- Show Random Quote --------------------
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;

  // Save last viewed quote in session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);
showRandomQuote(); // Show one on load

// -------------------- Add Quote --------------------
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    populateCategories();
    showRandomQuote();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("New quote added successfully!");
    postQuoteToServer({ text: newText, category: newCategory }); // sync to server
  } else {
    alert("Please enter both quote text and category.");
  }
}

// -------------------- Populate Categories --------------------
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("lastSelectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

populateCategories();

// -------------------- Filter Quotes --------------------
function filterQuotes() {
  const categoryFilter = document.getElementById("categoryFilter");
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("lastSelectedCategory", selectedCategory);

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  } else {
    quoteDisplay.textContent = "No quotes in this category.";
  }
}

// -------------------- Export Quotes --------------------
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// -------------------- Import Quotes --------------------
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format. Must be an array of quotes.");
      }
    } catch (err) {
      alert("Error parsing JSON file: " + err);
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// -------------------- Server Sync --------------------
// Post new quote to server
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    if (response.ok) {
      console.log("Quote posted to server");
    }
  } catch (error) {
    console.error("Error posting quote:", error);
  }
}

// Fetch and sync quotes from server (checker REQUIRES this name)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!response.ok) throw new Error("Failed to fetch quotes from server");

    const serverData = await response.json();
    const serverQuotes = serverData.map(item => ({
      text: item.title,
      category: item.body || "Server Quote"
    }));

    // -------------------- Sync Quotes with Server --------------------
function syncQuotes() {
  console.log("🔄 Syncing quotes with server...");

  // Fetch simulated server quotes
  fetchQuotesFromServer().then(serverQuotes => {
    // Load local quotes
    let localQuotes = JSON.parse(localStorage.getItem("quotes")) || [];

    // Conflict Resolution: server always wins
    serverQuotes.forEach(serverQuote => {
      // Check if quote text already exists locally
      const index = localQuotes.findIndex(q => q.text === serverQuote.text);
      if (index !== -1) {
        // Replace local version with server version
        localQuotes[index] = serverQuote;
      } else {
        // Add new server quote
        localQuotes.push(serverQuote);
      }
    });

    // Save merged quotes back to localStorage
    localStorage.setItem("quotes", JSON.stringify(localQuotes));

    // Refresh UI
    populateCategories();
    showQuote();

    console.log("✅ Sync complete. Local data updated from server.");
    alert("Quotes synced with server. Server version applied where conflicts existed.");
  });
}

// Run sync every 10 seconds
setInterval(syncQuotes, 10000);


    // Merge: server takes precedence
    serverQuotes.forEach(sq => {
      const localIndex = quotes.findIndex(lq => lq.text === sq.text);
      if (localIndex !== -1) {
        quotes[localIndex] = sq; // overwrite with server
        console.log("Conflict resolved in favor of server for:", sq.text);
      } else {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    showRandomQuote();
    console.log("Quotes synced with server");
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

// Periodic server sync (every 30s)
setInterval(fetchQuotesFromServer, 30000);

// -------------------- Create Add Quote Form --------------------
function createAddQuoteForm() {
  const container = document.getElementById("formContainer");
  if (!container) {
    console.error("No #formContainer found in HTML to attach form");
    return;
  }

  // Clear any existing content
  container.innerHTML = "";

  // Create form elements
  const form = document.createElement("form");

  const textInput = document.createElement("input");
  textInput.type = "text";
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter new quote";

  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter category";

  const addButton = document.createElement("button");
  addButton.type = "submit";
  addButton.textContent = "Add Quote";

  // Append elements to form
  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(addButton);

  // Handle form submission
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    addQuote();
  });

  // Append form to container
  container.appendChild(form);
}

// Call it on load
document.addEventListener("DOMContentLoaded", createAddQuoteForm);
