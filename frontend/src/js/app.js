// Simulated Data
const users = [
  { id: 1, name: "Alice Martin", quartier: "Centre", rating: 4.6, badge: "Bénévole Fiable" },
  { id: 2, name: "Karim Hassan", quartier: "Nord", rating: 4.9, badge: "Expert" },
  { id: 3, name: "Sophie Dupont", quartier: "Sud", rating: 4.8, badge: "Bénévole Fiable" },
  { id: 4, name: "Jean Leclerc", quartier: "Est", rating: 4.5, badge: "Actif" },
  { id: 5, name: "Marie Rousseau", quartier: "Ouest", rating: 4.7, badge: "Bénévole Fiable" },
]

const requests = [
  {
    id: 1,
    userId: 1,
    title: "Besoin d'aide pour des courses",
    category: "Courses",
    quartier: "Centre",
    description:
      "Je ne peux pas sortir cette semaine en raison d'une mobilité réduite. Quelqu'un pourrait-il m'aider à faire les courses? Je peux rembourser les frais.",
    status: "open",
    date: "2025-01-10",
  },
  {
    id: 2,
    userId: 2,
    title: "Aide au déménagement",
    category: "Déménagement",
    quartier: "Nord",
    description:
      "Je dois déménager mes affaires au 3ème étage. J'ai besoin de 2-3 personnes pour m'aider le samedi 15 janvier à 10h.",
    status: "open",
    date: "2025-01-08",
  },
  {
    id: 3,
    userId: 3,
    title: "Babysitting urgent",
    category: "Garde",
    quartier: "Sud",
    description: "Cherche quelqu'un pour garder ma fille (5 ans) samedi soir. Elle est très gentille et aime jouer.",
    status: "open",
    date: "2025-01-12",
  },
  {
    id: 4,
    userId: 4,
    title: "Installation ordinateur",
    category: "Informatique",
    quartier: "Est",
    description: "J'ai un nouvel ordinateur mais j'ai besoin d'aide pour le configurer et installer mes programmes.",
    status: "closed",
    date: "2025-01-05",
  },
  {
    id: 5,
    userId: 5,
    title: "Nettoyage après travaux",
    category: "Ménage",
    quartier: "Ouest",
    description: "Après les rénovations de ma cuisine, j'aurais besoin d'un bon nettoyage en profondeur.",
    status: "open",
    date: "2025-01-11",
  },
  {
    id: 6,
    userId: 1,
    title: "Réparation fuite d'eau",
    category: "Réparation",
    quartier: "Centre",
    description: "Petit tuyau qui fuit sous l'évier. Si quelqu'un sait faire, ce serait super.",
    status: "open",
    date: "2025-01-13",
  },
]

const offers = [
  {
    id: 1,
    userId: 2,
    title: "Cours d'anglais personnalisés",
    category: "Éducation",
    quartier: "Nord",
    description: "Je donne des cours d'anglais pour tous les niveaux. Tarif: 15€/h",
  },
  {
    id: 2,
    userId: 3,
    title: "Dépannage informatique",
    category: "Informatique",
    quartier: "Sud",
    description: "Je peux vous aider pour tous les problèmes informatiques: virus, installation, paramétrage.",
  },
  {
    id: 3,
    userId: 4,
    title: "Promenade de chiens",
    category: "Services",
    quartier: "Est",
    description: "Je promène vos chiens pendant que vous êtes au travail. 30€ pour 45 minutes.",
  },
  {
    id: 4,
    userId: 5,
    title: "Cuisine faite maison",
    category: "Cuisine",
    quartier: "Ouest",
    description: "Je prépare des plats équilibrés et délicieux pour votre semaine.",
  },
  {
    id: 5,
    userId: 1,
    title: "Soutien scolaire maths",
    category: "Éducation",
    quartier: "Centre",
    description: "Aide en mathématiques du primaire à la 3ème. Méthode pédagogique adaptée.",
  },
]

const conversations = [
  { id: 1, userIds: [1, 2], title: "Alice - Karim" },
  { id: 2, userIds: [1, 3], title: "Alice - Sophie" },
  { id: 3, userIds: [2, 4], title: "Karim - Jean" },
]

const messages = [
  {
    convId: 1,
    senderId: 1,
    text: "Bonjour Karim, tu as vu ma demande d'aide au déménagement?",
    date: "2025-01-10 10:00",
  },
  {
    convId: 1,
    senderId: 2,
    text: "Bonjour Alice! Oui, je serais intéressé. Quel jour exactement?",
    date: "2025-01-10 10:05",
  },
  { convId: 1, senderId: 1, text: "C'est le 15 janvier à 10h. Ca t'irait?", date: "2025-01-10 10:08" },
  {
    convId: 2,
    senderId: 1,
    text: "Salut Sophie! Je cherche quelqu'un pour du babysitting samedi.",
    date: "2025-01-11 14:30",
  },
  {
    convId: 2,
    senderId: 3,
    text: "Bonjour! Je pourrais peut-être vous aider. Quel âge a l'enfant?",
    date: "2025-01-11 14:35",
  },
  { convId: 3, senderId: 2, text: "Salut Jean, t'as une idée pour ma réparation?", date: "2025-01-09 09:00" },
  { convId: 3, senderId: 4, text: "Oui, je crois pouvoir t'aider. C'est une fuite simple?", date: "2025-01-09 09:10" },
]

let currentUserId = 1

// Admin data
const adminUsers = [{ id: 100, name: "Admin System", role: "admin" }]
const pendingRequests = []

// Authentication state management
const authState = {
  isAuthenticated: false,
  userId: null,
  userToken: null,
  currentUser: null,
}

function initializeAuth() {
  const savedUserId = localStorage.getItem("userId")
  const savedToken = localStorage.getItem("userToken")

  if (savedUserId && savedToken) {
    authState.isAuthenticated = true
    authState.userId = savedUserId
    authState.userToken = savedToken
    currentUserId = Number.parseInt(savedUserId)
    console.log("[v0] Auth restored from storage")
  }
}

function isUserAuthenticated() {
  return authState.isAuthenticated
}

function logoutUser() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userToken");
  localStorage.removeItem("rememberEmail");
  localStorage.removeItem("userRole"); // 🔴 très important

  authState.isAuthenticated = false;
  authState.userId = null;
  authState.userToken = null;

  console.log("[v0] User logged out");
  window.location.href = "index.html";
}


function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authState.userToken}`,
  }
}

// Helper function to get user name
function getUserName(userId) {
  const user = users.find((u) => u.id === userId)
  return user ? user.name : "Utilisateur inconnu"
}

// Helper function to get user by ID
function getUser(userId) {
  return users.find((u) => u.id === userId)
}

// Function to create a new request
function createRequest(title, category, quartier, description) {
  const newRequest = {
    id: requests.length + 1,
    userId: currentUserId,
    title,
    category,
    quartier,
    description,
    status: "pending",
    date: new Date().toISOString().split("T")[0],
  }
  requests.push(newRequest)
  pendingRequests.push(newRequest.id)
  return newRequest
}

// Function to create a new offer
function createOffer(title, category, quartier, description) {
  const newOffer = {
    id: offers.length + 1,
    userId: currentUserId,
    title,
    category,
    quartier,
    description,
  }
  offers.push(newOffer)
  return newOffer
}

// Load home page requests (limited)
function loadHomeRequests() {
  const container = document.getElementById("requestsContainer")
  if (!container) return

  const homeRequests = requests.slice(0, 3)
  container.innerHTML = homeRequests.map((request) => createRequestCard(request)).join("")
}

// Load home page offers (limited)
function loadHomeOffers() {
  const container = document.getElementById("offersContainer")
  if (!container) return

  const homeOffers = offers.slice(0, 3)
  container.innerHTML = homeOffers.map((offer) => createOfferCard(offer)).join("")
}

// Create request card HTML
function createRequestCard(request) {
  const user = getUser(request.userId)
  const isFav = isFavorite(request.id, "request")
  return `
    <a href="request_view.html?id=${request.id}" class="card">
      <div class="card-header">
        <span class="card-category">${request.category}</span>
        <button class="favorite-btn ${isFav ? "active" : ""}" onclick="event.stopPropagation(); toggleFavorite(${request.id}, 'request'); event.target.classList.toggle('active')">
          ${isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <h3 class="card-title">${request.title}</h3>
      <p class="card-description">${request.description.substring(0, 100)}...</p>
      <div class="card-footer">
        <span class="card-location">📍 ${request.quartier}</span>
        <span class="card-date">${new Date(request.date).toLocaleDateString("fr-FR")}</span>
      </div>
    </a>
  `
}

// Create offer card HTML
function createOfferCard(offer) {
  const user = getUser(offer.userId);
  const isFav = isFavorite(offer.id, "offer");

  return `
    <a href="offer_view.html?id=${offer.id}" class="card">
      <div class="card-header">
        <span class="card-category">${offer.category}</span>
        <button
          class="favorite-btn ${isFav ? "active" : ""}"
          onclick="event.preventDefault(); toggleFavorite(${offer.id}, 'offer'); this.classList.toggle('active');"
        >
          ${isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <h3 class="card-title">${offer.title}</h3>
      <p class="card-description">${offer.description.substring(0, 100)}...</p>
      <div class="card-footer">
        <span class="card-location">📍 ${offer.quartier}</span>
        <span class="card-date">Par ${user.name}</span>
      </div>
    </a>
  `;
}


// Load all requests with filtering
function loadRequests() {
  const container = document.getElementById("filteredRequestsContainer")
  if (!container) return

  const category = document.getElementById("categoryFilter").value
  const quartier = document.getElementById("quartierFilter").value
  const status = document.getElementById("statusFilter").value
  const search = document.getElementById("searchFilter").value.toLowerCase()

  const filtered = requests.filter((request) => {
    const matchCategory = !category || request.category === category
    const matchQuartier = !quartier || request.quartier === quartier
    const matchStatus = !status || request.status === status
    const matchSearch =
      !search || request.title.toLowerCase().includes(search) || request.description.toLowerCase().includes(search)
    return matchCategory && matchQuartier && matchStatus && matchSearch
  })

  if (filtered.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune demande ne correspond à vos critères.</p>'
    return
  }

  container.innerHTML = filtered
    .map((request) => {
      const user = getUser(request.userId)
      const isFav = isFavorite(request.id, "request")
      return `
      <a href="request_view.html?id=${request.id}" class="card-horizontal">
        <div class="card-horizontal-content">
          <h4 class="card-horizontal-title">${request.title}</h4>
          <div class="card-horizontal-meta">
            <span>${request.category}</span>
            <span>📍 ${request.quartier}</span>
            <span>${new Date(request.date).toLocaleDateString("fr-FR")}</span>
          </div>
          <p class="card-horizontal-description">${request.description}</p>
        </div>
        <div class="card-horizontal-status">
          <span class="card-status ${request.status}">${request.status === "open" ? "Ouverte" : "Fermée"}</span>
          <span style="font-size: 12px; color: #999;">Par ${user.name}</span>
          <button class="favorite-btn ${isFav ? "active" : ""}" onclick="event.stopPropagation(); toggleFavorite(${request.id}, 'request'); event.target.classList.toggle('active')">
            ${isFav ? "❤️" : "🤍"}
          </button>
        </div>
      </a>
    `
    })
    .join("")
}

// Load request details
function loadRequestDetails(requestId) {
  const container = document.getElementById("requestDetailsContainer")
  if (!container) return

  const request = requests.find((r) => r.id === Number.parseInt(requestId))
  if (!request) {
    container.innerHTML = '<p class="empty-state">Demande non trouvée.</p>'
    return
  }

  const user = getUser(request.userId)

  container.innerHTML = `
    <h2>${request.title}</h2>
    <div class="request-detail-header">
      <div class="request-detail-meta">
        <span><strong>Catégorie:</strong> ${request.category}</span>
        <span><strong>Quartier:</strong> 📍 ${request.quartier}</span>
        <span><strong>Statut:</strong> ${request.status === "open" ? "✓ Ouverte" : "✗ Fermée"}</span>
        <span><strong>Date:</strong> ${new Date(request.date).toLocaleDateString("fr-FR")}</span>
      </div>
    </div>

    <div class="request-detail-user">
      <h4>Demandeur</h4>
      <div class="request-detail-user-info">
        <span><strong>${user.name}</strong></span>
        <span>⭐ ${user.rating}</span>
        <span>📍 ${user.quartier}</span>
        <span>${user.badge}</span>
      </div>
    </div>

    <div class="request-detail-description">
      <h4>Description</h4>
      <p>${request.description}</p>
    </div>

    <div class="request-detail-actions">
      <button class="btn btn-secondary" onclick="openContactForm(${request.userId})">Contacter</button>
      <button class="btn btn-secondary" onclick="viewUserProfile(${request.userId})">Voir le profil</button>
    </div>
  `
}

function loadOfferDetails(offerId) {
  const container = document.getElementById("offerDetailsContainer");
  if (!container) return;

  const offer = offers.find((o) => o.id === Number.parseInt(offerId));
  if (!offer) {
    container.innerHTML = '<p class="empty-state">Offre non trouvée.</p>';
    return;
  }

  const user = getUser(offer.userId);

  container.innerHTML = `
    <h2>${offer.title}</h2>
    <div class="request-detail-header">
      <div class="request-detail-meta">
        <span><strong>Catégorie :</strong> ${offer.category}</span>
        <span><strong>Quartier :</strong> 📍 ${offer.quartier}</span>
      </div>
    </div>

    <div class="request-detail-user">
      <h4>Proposant</h4>
      <div class="request-detail-user-info">
        <span><strong>${user.name}</strong></span>
        <span>⭐ ${user.rating}</span>
        <span>📍 ${user.quartier}</span>
        <span>${user.badge}</span>
      </div>
    </div>

    <div class="request-detail-description">
      <h4>Description</h4>
      <p>${offer.description}</p>
    </div>

    <div class="request-detail-actions">
      <button class="btn btn-secondary" onclick="openContactForm(${offer.userId})">Contacter</button>
      <button class="btn btn-secondary" onclick="viewUserProfile(${offer.userId})">Voir le profil</button>
    </div>
  `;
}


// Load all offers
function loadOffers() {
  const container = document.getElementById("offersListContainer");
  if (!container) return;

  // Récupération des filtres (si présents sur la page Offres)
  const categorySelect = document.getElementById("offerCategoryFilter");
  const quartierSelect = document.getElementById("offerQuartierFilter");
  const searchInput = document.getElementById("offerSearchFilter");

  const category = categorySelect ? categorySelect.value : "";
  const quartier = quartierSelect ? quartierSelect.value : "";
  const search = searchInput ? searchInput.value.trim().toLowerCase() : "";

  // Filtrage des offres
  let filtered = offers.filter((offer) => {
    const matchCategory = !category || offer.category === category;
    const matchQuartier = !quartier || offer.quartier === quartier;

    let matchSearch = true;
    if (search) {
      const user = getUser(offer.userId);
      const title = offer.title.toLowerCase();
      const description = offer.description.toLowerCase();
      const userName = user ? user.name.toLowerCase() : "";

      matchSearch =
        title.includes(search) ||
        description.includes(search) ||
        userName.includes(search);
    }

    return matchCategory && matchQuartier && matchSearch;
  });

  // Aucun résultat
  if (filtered.length === 0) {
    container.innerHTML = `
      <p class="empty-state">
        Aucune offre ne correspond à vos critères.
      </p>
    `;
    return;
  }

  // Cartes cliquables, sans bouton "Voir les détails"
  container.innerHTML = filtered
    .map((offer) => {
      const user = getUser(offer.userId);
      const isFav = isFavorite(offer.id, "offer");

      return `
        <a href="offer_view.html?id=${offer.id}" class="card">
          <div class="card-header">
            <span class="card-category">${offer.category}</span>
            <button
              class="favorite-btn ${isFav ? "active" : ""}"
              onclick="event.preventDefault(); toggleFavorite(${offer.id}, 'offer'); this.classList.toggle('active');"
            >
              ${isFav ? "❤️" : "🤍"}
            </button>
          </div>
          <h3 class="card-title">${offer.title}</h3>
          <p class="card-description">${offer.description}</p>
          <div class="card-footer">
            <div>
              <span class="card-location">📍 ${offer.quartier}</span>
              <div style="font-size: 12px; color: #999; margin-top: 4px;">Par ${user.name}</div>
            </div>
            <span class="card-date">⭐ ${user.rating}</span>
          </div>
        </a>
      `;
    })
    .join("");
}



// Load conversations
function loadConversations() {
  const container = document.getElementById("conversationsContainer")
  if (!container) return

  container.innerHTML = conversations
    .map(
      (conv) => `
    <div class="conversation-item" onclick="loadMessages(${conv.id})">${conv.title}</div>
  `,
    )
    .join("")

  if (conversations.length > 0) {
    loadMessages(conversations[0].id)
  }
}

// Load messages for a conversation
function loadMessages(convId) {
  const container = document.getElementById("messagesContent")
  const convMessages = messages.filter((m) => m.convId === convId)
  const conv = conversations.find((c) => c.id === convId)

  // Mark conversation as active
  document.querySelectorAll(".conversation-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[onclick="loadMessages(${convId})"]`)?.classList.add("active")

  if (!conv || convMessages.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucun message dans cette conversation.</p>'
    return
  }

  container.innerHTML = `
    <div class="messages-header">
      <h4>${conv.title}</h4>
    </div>
    <div class="messages-list">
      ${convMessages
        .map(
          (msg) => `
        <div class="message ${msg.senderId === currentUserId ? "sent" : "received"}">
          <div class="message-bubble">${msg.text}</div>
          <span class="message-time">${msg.date.split(" ")[1]}</span>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="message-input-group">
      <input type="text" class="message-input" placeholder="Écrivez votre message...">
      <button class="btn btn-primary btn-sm">Envoyer</button>
    </div>
  `
}

// Load user profile
function loadProfile() {
  const container = document.getElementById("profileContainer")
  const user = getUser(currentUserId)

  const userRequests = requests.filter((r) => r.userId === currentUserId).length
  const userOffers = offers.filter((o) => o.userId === currentUserId).length
  const userConversations = conversations.filter((c) => c.userIds.includes(currentUserId)).length

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">👤</div>
      <h2 class="profile-name">${user.name}</h2>
      <p class="profile-location">📍 ${user.quartier}</p>
    </div>

    <div class="profile-stats">
      <div class="stat-card">
        <div class="stat-value">${userRequests}</div>
        <div class="stat-label">Demandes</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${userOffers}</div>
        <div class="stat-label">Offres</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${user.rating}</div>
        <div class="stat-label">Note</div>
      </div>
    </div>

    <div class="profile-section">
      <h3>Badge & Réputation</h3>
      <div style="padding: 16px 0;">
        <p><strong style="color: var(--primary);">⭐ ${user.badge}</strong></p>
        <p style="margin-top: 8px; color: #666;">Note moyenne: ${user.rating}/5</p>
      </div>
    </div>

    <div class="profile-section">
      <h3>Avis Récents</h3>
      <div class="review-item">
        <div class="review-header">
          <span><strong>Sophie Dupont</strong></span>
          <span class="review-rating">⭐⭐⭐⭐⭐ 5/5</span>
        </div>
        <p class="review-text">Très rapide et efficace! ${user.name} a bien aidé avec les courses. Vraiment recommandé!</p>
      </div>
      <div class="review-item">
        <div class="review-header">
          <span><strong>Jean Leclerc</strong></span>
          <span class="review-rating">⭐⭐⭐⭐ 4/5</span>
        </div>
        <p class="review-text">Bon travail, délais respectés. À refaire!</p>
      </div>
      <div class="review-item">
        <div class="review-header">
          <span><strong>Karim Hassan</strong></span>
          <span class="review-rating">⭐⭐⭐⭐⭐ 5/5</span>
        </div>
        <p class="review-text">Personne de confiance. Parfait pour collaborer sur des projets communautaires.</p>
      </div>
    </div>
  `
}

function loadPublicProfile(userId) {
  const container = document.getElementById("profileContainer");
  if (!container) return;

  const user = getUser(userId);
  if (!user) {
    container.innerHTML = `<p class="empty-state">Utilisateur introuvable.</p>`;
    return;
  }

  // Tu peux adapter ce HTML pour qu'il ressemble exactement à ton profil actuel,
  // mais sans les boutons "Modifier mon profil" par exemple.
  container.innerHTML = `
    <div class="profile-header">
      <div>
        <h2>${user.name}</h2>
        <p>${user.badge}</p>
      </div>
      <div class="profile-rating">
        <span>⭐ ${user.rating}</span>
        <span>${user.quartier}</span>
      </div>
    </div>

    <div class="profile-section">
      <h3>À propos</h3>
      <p>${user.bio || "Ce membre n'a pas encore rempli sa biographie."}</p>
    </div>

    <div class="profile-section">
      <h3>Informations de confiance</h3>
      <ul class="stats-list">
        <li><strong>Aides réalisées :</strong> ${user.stats?.aidesRealisees || 0}</li>
        <li><strong>Demandes effectuées :</strong> ${user.stats?.demandesEffectuees || 0}</li>
      </ul>
    </div>
  `;
}


// Admin functions
// Load admin dashboard for requests
function loadAdminDashboard() {
  const container = document.getElementById("adminDashboardContainer")
  if (!container) return

  // Separate requests by status
  const openRequests = requests.filter((r) => r.status === "open")
  const pendingRequestsList = requests.filter((r) => r.status === "pending")
  const closedRequests = requests.filter((r) => r.status === "closed")

  container.innerHTML = `
    <div class="admin-header">
      <h2>Tableau de Bord Administrateur - Demandes</h2>
      <p>Gérez et acceptez les nouvelles demandes d'aide</p>
    </div>

    <div class="admin-stats">
      <div class="admin-stat-card">
        <div class="admin-stat-value">${pendingRequestsList.length}</div>
        <div class="admin-stat-label">En attente</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-value">${openRequests.length}</div>
        <div class="admin-stat-label">Acceptées</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-value">${closedRequests.length}</div>
        <div class="admin-stat-label">Fermées</div>
      </div>
    </div>

    <div class="admin-section">
      <h3>Demandes en Attente d'Approbation (${pendingRequestsList.length})</h3>
      <div class="admin-list">
        ${
          pendingRequestsList.length === 0
            ? '<p class="empty-state">Aucune demande en attente.</p>'
            : pendingRequestsList
                .map((request) => {
                  const user = getUser(request.userId)
                  return `
                <div class="admin-item">
                  <div class="admin-item-content">
                    <h4>${request.title}</h4>
                    <p class="admin-item-meta">
                      <span>${request.category}</span>
                      <span>📍 ${request.quartier}</span>
                      <span>Par ${user.name}</span>
                      <span>${new Date(request.date).toLocaleDateString("fr-FR")}</span>
                    </p>
                    <p class="admin-item-description">${request.description}</p>
                  </div>
                  <div class="admin-item-actions">
                    <button class="btn btn-primary btn-sm" onclick="approveRequest(${request.id})">Accepter</button>
                    <button class="btn btn-secondary btn-sm" onclick="rejectRequest(${request.id})">Rejeter</button>
                  </div>
                </div>
              `
                })
                .join("")
        }
      </div>
    </div>

    <div class="admin-section">
      <h3>Demandes Acceptées (${openRequests.length})</h3>
      <div class="admin-list">
        ${
          openRequests.length === 0
            ? '<p class="empty-state">Aucune demande acceptée.</p>'
            : openRequests
                .map((request) => {
                  const user = getUser(request.userId)
                  return `
                <div class="admin-item">
                  <div class="admin-item-content">
                    <h4>${request.title}</h4>
                    <p class="admin-item-meta">
                      <span>${request.category}</span>
                      <span>📍 ${request.quartier}</span>
                      <span>Par ${user.name}</span>
                    </p>
                  </div>
                  <div class="admin-item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="closeRequest(${request.id})">Fermer</button>
                  </div>
                </div>
              `
                })
                .join("")
        }
      </div>
    </div>
  `
}

// Admin function to approve a request
function approveRequest(requestId) {
  const request = requests.find((r) => r.id === requestId)
  if (request) {
    request.status = "open"
    const index = pendingRequests.indexOf(requestId)
    if (index > -1) pendingRequests.splice(index, 1)
    loadAdminDashboard()
    alert(`Demande "${request.title}" acceptée!`)
  }
}

// Admin function to reject a request
function rejectRequest(requestId) {
  const index = requests.findIndex((r) => r.id === requestId)
  if (index > -1) {
    requests.splice(index, 1)
  }
  const pendingIndex = pendingRequests.indexOf(requestId)
  if (pendingIndex > -1) pendingRequests.splice(pendingIndex, 1)
  loadAdminDashboard()
  alert("Demande rejetée et supprimée.")
}

// Admin function to close a request
function closeRequest(requestId) {
  const request = requests.find((r) => r.id === requestId)
  if (request) {
    request.status = "closed"
    loadAdminDashboard()
    alert(`Demande "${request.title}" fermée.`)
  }
}

// Load admin offers dashboard
function loadAdminOffersDashboard() {
  const container = document.getElementById("adminOffersContainer")
  if (!container) return

  container.innerHTML = `
    <div class="admin-header">
      <h2>Tableau de Bord Administrateur - Offres</h2>
      <p>Gérez et modérez les offres de services</p>
    </div>

    <div class="admin-stats">
      <div class="admin-stat-card">
        <div class="admin-stat-value">${offers.length}</div>
        <div class="admin-stat-label">Offres Publiées</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-value">${offers.length > 0 ? Math.ceil(offers.length / 2) : 0}</div>
        <div class="admin-stat-label">Offres Approuvées</div>
      </div>
    </div>

    <div class="admin-section">
      <h3>Toutes les Offres (${offers.length})</h3>
      <div class="admin-list">
        ${
          offers.length === 0
            ? '<p class="empty-state">Aucune offre publiée.</p>'
            : offers
                .map((offer) => {
                  const user = getUser(offer.userId)
                  return `
                <div class="admin-item">
                  <div class="admin-item-content">
                    <h4>${offer.title}</h4>
                    <p class="admin-item-meta">
                      <span>${offer.category}</span>
                      <span>📍 ${offer.quartier}</span>
                      <span>Par ${user.name}</span>
                      <span>⭐ ${user.rating}</span>
                    </p>
                    <p class="admin-item-description">${offer.description}</p>
                  </div>
                  <div class="admin-item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="flagOffer(${offer.id})">Signaler</button>
                  </div>
                </div>
              `
                })
                .join("")
        }
      </div>
    </div>
  `
}

// Flag an offer for review
function flagOffer(offerId) {
  alert("Offre signalée pour modération. Merci!")
}

// Load create request form
function loadCreateRequestForm() {
  const container = document.getElementById("createRequestContainer")
  if (!container) return

  const categories = ["Courses", "Déménagement", "Garde", "Informatique", "Ménage", "Réparation", "Autre"]
  const quartiers = ["Centre", "Nord", "Sud", "Est", "Ouest"]

  container.innerHTML = `
    <div class="form-header">
      <h2>Créer une Nouvelle Demande</h2>
      <p>Décrivez le service que vous recherchez et trouvez quelqu'un pour vous aider</p>
    </div>

    <form class="form-container" onsubmit="submitCreateRequest(event)">
      <div class="form-group">
        <label for="requestTitle">Titre de la demande *</label>
        <input type="text" id="requestTitle" placeholder="Ex: Besoin d'aide pour les courses" required class="form-input">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="requestCategory">Catégorie *</label>
          <select id="requestCategory" required class="form-input">
            <option value="">Sélectionner une catégorie</option>
            ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label for="requestQuartier">Quartier *</label>
          <select id="requestQuartier" required class="form-input">
            <option value="">Sélectionner un quartier</option>
            ${quartiers.map((q) => `<option value="${q}">${q}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="requestDescription">Description détaillée *</label>
        <textarea id="requestDescription" placeholder="Décrivez précisément ce dont vous avez besoin..." required class="form-textarea"></textarea>
      </div>

      <button type="submit" class="btn btn-primary">Publier la Demande</button>
      <a href="requests.html" class="btn btn-secondary">Annuler</a>
    </form>
  `
}

// Submit create request form
function submitCreateRequest(event) {
  event.preventDefault()

  const title = document.getElementById("requestTitle").value
  const category = document.getElementById("requestCategory").value
  const quartier = document.getElementById("requestQuartier").value
  const description = document.getElementById("requestDescription").value

  if (title && category && quartier && description) {
    const newRequest = createRequest(title, category, quartier, description)
    alert(`Demande créée! Statut: En attente d'approbation administrateur`)
    window.location.href = "requests.html"
  }
}

// Load create offer form
function loadCreateOfferForm() {
  const container = document.getElementById("createOfferContainer")
  if (!container) return

  const categories = ["Éducation", "Informatique", "Services", "Cuisine", "Ménage", "Réparation", "Autre"]
  const quartiers = ["Centre", "Nord", "Sud", "Est", "Ouest"]

  container.innerHTML = `
    <div class="form-header">
      <h2>Créer une Nouvelle Offre</h2>
      <p>Proposez vos services et trouvez des clients qui en ont besoin</p>
    </div>

    <form class="form-container" onsubmit="submitCreateOffer(event)">
      <div class="form-group">
        <label for="offerTitle">Titre de l'offre *</label>
        <input type="text" id="offerTitle" placeholder="Ex: Cours d'anglais personnalisés" required class="form-input">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="offerCategory">Catégorie *</label>
          <select id="offerCategory" required class="form-input">
            <option value="">Sélectionner une catégorie</option>
            ${categories.map((cat) => `<option value="${cat}">${cat}</option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label for="offerQuartier">Quartier *</label>
          <select id="offerQuartier" required class="form-input">
            <option value="">Sélectionner un quartier</option>
            ${quartiers.map((q) => `<option value="${q}">${q}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="offerDescription">Description détaillée *</label>
        <textarea id="offerDescription" placeholder="Décrivez vos services, tarifs, disponibilités..." required class="form-textarea"></textarea>
      </div>

      <button type="submit" class="btn btn-primary">Publier l'Offre</button>
      <a href="offers.html" class="btn btn-secondary">Annuler</a>
    </form>
  `
}

// Submit create offer form
function submitCreateOffer(event) {
  event.preventDefault()

  const title = document.getElementById("offerTitle").value
  const category = document.getElementById("offerCategory").value
  const quartier = document.getElementById("offerQuartier").value
  const description = document.getElementById("offerDescription").value

  if (title && category && quartier && description) {
    createOffer(title, category, quartier, description)
    alert("Offre créée avec succès!")
    window.location.href = "offers.html"
  }
}

// Utility functions
function openContactForm(userId) {
  const user = getUser(userId)
  window.location.href = "messages.html"
}

function viewUserProfile(userId) {
  // On redirige vers profile.html en passant l'id de l'utilisateur dans l'URL
  window.location.href = `profile.html?userId=${userId}`;
}


// Function to render authentication menu
function renderAuthMenu() {
  const authMenu = document.getElementById("authMenu")
  if (!authMenu) return

  if (isUserAuthenticated()) {
    const user = getUser(currentUserId)
    authMenu.innerHTML = `
      <div class="auth-user-menu">
        <span class="auth-user-name">${user.name}</span>
        <button class="btn btn-secondary btn-sm" onclick="logoutUser()">Déconnexion</button>
      </div>
    `
  } else {
    authMenu.innerHTML = `
      <div class="auth-buttons">
        <a href="login.html" class="btn btn-primary btn-sm">Connexion</a>
        <a href="register.html" class="btn btn-secondary btn-sm">S'inscrire</a>
      </div>
    `
  }
}

// Function to check authentication and redirect if needed
function requireAuth() {
  if (!isUserAuthenticated()) {
    alert("Vous devez être connecté pour accéder à cette page")
    window.location.href = "login.html"
    return false
  }
  return true
}
// Vérifie si l'utilisateur connecté est un administrateur
function isAdmin() {
  const role = localStorage.getItem("userRole");
  const token = localStorage.getItem("userToken");

  // On considère "admin" connecté si rôle = admin + token présent
  return role === "admin" && !!token;
}

// À utiliser sur les pages admin uniquement
function requireAdminAuth() {
  if (!isAdmin()) {
    alert("Accès réservé aux administrateurs. Merci de vous connecter avec un compte administrateur.");
    window.location.href = "login.html";
    return false;
  }
  return true;
}



const favorites = JSON.parse(localStorage.getItem("favorites")) || []
let notifications = JSON.parse(localStorage.getItem("notifications")) || []
const ratings = JSON.parse(localStorage.getItem("ratings")) || []

// Toggle favorite
function toggleFavorite(itemId, itemType) {
  const favoriteId = `${itemType}-${itemId}`
  const index = favorites.indexOf(favoriteId)

  if (index > -1) {
    favorites.splice(index, 1)
  } else {
    favorites.push(favoriteId)
  }

  localStorage.setItem("favorites", JSON.stringify(favorites))
  console.log("[v0] Favorite toggled:", favoriteId)
}

// Check if favorite
function isFavorite(itemId, itemType) {
  return favorites.includes(`${itemType}-${itemId}`)
}

// Load favorites page
function loadFavorites() {
  const container = document.getElementById("favoritesContainer")
  if (!container) return

  const favoriteRequests = requests.filter((r) => isFavorite(r.id, "request"))
  const favoriteOffers = offers.filter((o) => isFavorite(o.id, "offer"))
  const allFavorites = [
    ...favoriteRequests.map((r) => ({ ...r, type: "request" })),
    ...favoriteOffers.map((o) => ({ ...o, type: "offer" })),
  ]

  if (allFavorites.length === 0) {
    container.innerHTML = '<p class="empty-state">Vous n\'avez aucun favori pour le moment.</p>'
    return
  }

  container.innerHTML = allFavorites
    .map((item) => {
      if (item.type === "request") {
        return createRequestCard(item)
      } else {
        return createOfferCard(item)
      }
    })
    .join("")
}

function addNotification(message, type = "info") {
  const notification = {
    id: Date.now(),
    message,
    type,
    date: new Date().toISOString(),
    read: false,
  }
  notifications.unshift(notification)
  localStorage.setItem("notifications", JSON.stringify(notifications))
}

function loadNotifications() {
  const container = document.getElementById("notificationsContainer")
  if (!container) return

  if (notifications.length === 0) {
    container.innerHTML = '<p class="empty-state">Vous n\'avez aucune notification.</p>'
    return
  }

  container.innerHTML = notifications
    .map(
      (notif) => `
    <div class="notification-item ${notif.read ? "read" : "unread"}">
      <div class="notification-icon ${notif.type}">
        ${notif.type === "info" ? "ℹ️" : notif.type === "success" ? "✓" : notif.type === "warning" ? "⚠️" : "⚠️"}
      </div>
      <div class="notification-content">
        <p>${notif.message}</p>
        <small>${new Date(notif.date).toLocaleString("fr-FR")}</small>
      </div>
      <button class="notification-close" onclick="deleteNotification(${notif.id})">✕</button>
    </div>
  `,
    )
    .join("")
}

function deleteNotification(notifId) {
  notifications = notifications.filter((n) => n.id !== notifId)
  localStorage.setItem("notifications", JSON.stringify(notifications))
  loadNotifications()
}

function loadUserDashboard() {
  const container = document.getElementById("dashboardContainer")
  if (!container) return

  const user = getUser(currentUserId)
  const userRequests = requests.filter((r) => r.userId === currentUserId)
  const userOffers = offers.filter((o) => o.userId === currentUserId)
  const userMessages = conversations.filter((c) => c.userIds.includes(currentUserId))

  const pendingCount = userRequests.filter((r) => r.status === "pending").length
  const activeCount = userRequests.filter((r) => r.status === "open").length
  const completedCount = userRequests.filter((r) => r.status === "closed").length

  container.innerHTML = `
    <div class="dashboard-header">
      <h2>Mon Dashboard</h2>
      <p>Bienvenue, ${user.name}!</p>
    </div>

    <div class="dashboard-stats">
      <div class="dashboard-stat-card">
        <div class="stat-number">${userRequests.length}</div>
        <div class="stat-label">Demandes</div>
      </div>
      <div class="dashboard-stat-card">
        <div class="stat-number">${userOffers.length}</div>
        <div class="stat-label">Offres</div>
      </div>
      <div class="dashboard-stat-card">
        <div class="stat-number">${pendingCount}</div>
        <div class="stat-label">En Attente</div>
      </div>
      <div class="dashboard-stat-card">
        <div class="stat-number">${activeCount}</div>
        <div class="stat-label">Actives</div>
      </div>
      <div class="dashboard-stat-card">
        <div class="stat-number">${completedCount}</div>
        <div class="stat-label">Complétées</div>
      </div>
      <div class="dashboard-stat-card">
        <div class="stat-number">${user.rating}</div>
        <div class="stat-label">Note</div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="dashboard-section">
        <div class="dashboard-section-header">
          <h3>Mes Demandes Récentes</h3>
          <a href="requests.html" class="btn btn-sm btn-secondary">Voir tout</a>
        </div>
        <div class="dashboard-list">
          ${
            userRequests.length === 0
              ? '<p class="empty-state">Aucune demande</p>'
              : userRequests
                  .slice(0, 3)
                  .map(
                    (req) => `
            <div class="dashboard-item">
              <span class="item-title">${req.title}</span>
              <span class="item-status ${req.status}">${req.status === "open" ? "Ouverte" : req.status === "pending" ? "En attente" : "Fermée"}</span>
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>

      <div class="dashboard-section">
        <div class="dashboard-section-header">
          <h3>Mes Offres Récentes</h3>
          <a href="offers.html" class="btn btn-sm btn-secondary">Voir tout</a>
        </div>
        <div class="dashboard-list">
          ${
            userOffers.length === 0
              ? '<p class="empty-state">Aucune offre</p>'
              : userOffers
                  .slice(0, 3)
                  .map(
                    (off) => `
            <div class="dashboard-item">
              <span class="item-title">${off.title}</span>
              <span class="item-category">${off.category}</span>
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>

      <div class="dashboard-section">
        <div class="dashboard-section-header">
          <h3>Conversations Actives</h3>
          <a href="messages.html" class="btn btn-sm btn-secondary">Voir tout</a>
        </div>
        <div class="dashboard-list">
          ${
            userMessages.length === 0
              ? '<p class="empty-state">Aucune conversation</p>'
              : userMessages
                  .map(
                    (conv) => `
            <div class="dashboard-item">
              <span class="item-title">${conv.title}</span>
              <span class="item-date">Récemment actif</span>
            </div>
          `,
                  )
                  .join("")
          }
        </div>
      </div>

      <div class="dashboard-section">
        <div class="dashboard-section-header">
          <h3>Actions Rapides</h3>
        </div>
        <div class="quick-actions">
          <a href="create-request.html" class="quick-action-btn">+ Créer une Demande</a>
          <a href="create-offer.html" class="quick-action-btn">+ Créer une Offre</a>
          <a href="favorites.html" class="quick-action-btn">❤️ Mes Favoris</a>
          <a href="notifications.html" class="quick-action-btn">🔔 Notifications</a>
        </div>
      </div>
    </div>
  `
}

// Call initialization on script load
initializeAuth()
renderAuthMenu()
