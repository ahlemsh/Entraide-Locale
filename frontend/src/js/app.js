// Configuration API
// IMPORTANT : Ajuste ce chemin selon ton installation XAMPP
const API_BASE = "http://localhost/Projetweb/backend/public/api";

let currentUserId = null;

// Authentication state management
const authState = {
  isAuthenticated: false,
  userId: null,
  userToken: null,
  currentUser: null,
}

// Helper pour les appels API
async function fetchAPI(endpoint, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (authState.userToken) {
    headers["Authorization"] = `Bearer ${authState.userToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  // Vérification si la réponse est bien du JSON
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    console.error("Erreur API (Réponse non-JSON) :", text);
    throw new Error("Erreur serveur : La réponse n'est pas au format JSON (voir console)");
  }

  const data = await response.json();
  return data;
}

function initializeAuth() {
  const savedUserId = localStorage.getItem("userId")
  const savedToken = localStorage.getItem("userToken")

  if (savedUserId && savedToken) {
    authState.isAuthenticated = true
    authState.userId = savedUserId
    authState.userToken = savedToken
    currentUserId = Number.parseInt(savedUserId)
    console.log("Auth restored from storage")
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

  console.log("User logged out");
  window.location.href = "index.html";
}

// Fonction de connexion (à appeler depuis login.html)
async function loginUser(email, password) {
  try {
    const result = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (result.ok) {
      localStorage.setItem("userToken", result.token);
      localStorage.setItem("userId", result.user.id);
      localStorage.setItem("userRole", result.user.role);
      
      if (result.user.role === 'admin' || result.user.role === 'Admin') {
        window.location.href = "admin-offers.html";
      } else {
        window.location.href = "index.html";
      }
    } else {
      alert("Erreur de connexion: " + (result.message || "Inconnue"));
    }
  } catch (e) {
    console.error(e);
    alert("Erreur réseau");
  }
}

// Fonction d'inscription (à appeler depuis register.html)
async function registerUser(fullName, email, password, quartier) {
  try {
    const result = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name: fullName, email, password, quartier })
    });

    if (result.ok) {
      alert("Compte créé ! Connectez-vous.");
      window.location.href = "login.html";
    } else {
      alert("Erreur: " + result.message);
    }
  } catch (e) {
    console.error(e);
    alert("Erreur réseau");
  }
}

// Gestionnaire de soumission du formulaire de connexion
async function submitLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  
  if(email && password) {
    await loginUser(email, password);
  } else {
    alert("Veuillez remplir tous les champs");
  }
}

// Gestionnaire de soumission du formulaire d'inscription
async function submitRegister(event) {
  event.preventDefault();
  const fullName = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  const quartier = document.getElementById("registerQuartier").value;

  if (fullName && email && password && quartier) {
    await registerUser(fullName, email, password, quartier);
  } else {
    alert("Veuillez remplir tous les champs");
  }
}

// Function to create a new request
async function createRequest(title, categoryId, quartier, description) {
  try {
    const result = await fetchAPI('/requests', {
      method: 'POST',
      body: JSON.stringify({ title, category_id: categoryId, quartier, description })
    });
    return result;
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

// Function to create a new offer
async function createOffer(title, categoryId, quartier, description) {
  try {
    const result = await fetchAPI('/offers', {
      method: 'POST',
      body: JSON.stringify({ title, category_id: categoryId, quartier, description })
    });
    return result;
  } catch (e) {
    console.error(e);
    return { ok: false };
  }
}

// Load home page requests (limited)
async function loadHomeRequests() {
  const container = document.getElementById("requestsContainer")
  if (!container) return

  // Si l'utilisateur n'est pas connecté, on masque les sections et on affiche le message de bienvenue
  if (!isUserAuthenticated()) {
    // Masquer les conteneurs parents (les sections)
    if (container.parentElement) container.parentElement.style.display = 'none';
    const offersContainer = document.getElementById("offersContainer");
    if (offersContainer && offersContainer.parentElement) offersContainer.parentElement.style.display = 'none';

    // Injecter le message de bienvenue
    const mainContainer = document.querySelector('main .container');
    if (mainContainer) {
      mainContainer.innerHTML = `
        <div class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">La solidarité commence <br>au coin de la rue !</h1>
            <p class="hero-subtitle">
              Entraide est une plateforme pour connecter les voisins : publiez une offre d'aide ou une demande,
              trouvez de l’aide rapidement et échangez en toute simplicité et sécurité
            </p>
            <p class="hero-cta-text">Rejoignez notre communauté</p>
            <div class="hero-buttons">
              <a href="login.html" class="btn btn-primary btn-lg">Se connecter</a>
              <a href="register.html" class="btn btn-outline btn-lg">Créer un compte</a>
            </div>
          </div>
          
          <div class="hero-features">
            <div class="feature-card">
              <div class="feature-icon-wrapper">🤝</div>
              <h3>Entraide Locale</h3>
              <p>Connectez-vous avec des voisins de confiance prêts à vous aider.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrapper">⚡</div>
              <h3>Rapide & Simple</h3>
              <p>Publiez une demande ou une offre en moins de 2 minutes.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon-wrapper">🛡️</div>
              <h3>100% Sécurisé</h3>
              <p>Profils vérifiés et système d'avis pour des échanges sereins.</p>
            </div>
          </div>
        </div>
      `;
    }
    return;
  }

  const data = await fetchAPI('/requests?page=1');
  if (data.ok && data.requests) {
    const homeRequests = data.requests.slice(0, 3);
    container.innerHTML = homeRequests.map((request) => createRequestCard(request)).join("");
  }
}

// Load home page offers (limited)
async function loadHomeOffers() {
  const container = document.getElementById("offersContainer")
  if (!container) return

  if (!isUserAuthenticated()) return; // Déjà géré par loadHomeRequests

  const data = await fetchAPI('/offers?page=1');
  if (data.ok && data.offers) {
    const homeOffers = data.offers.slice(0, 3);
    container.innerHTML = homeOffers.map((offer) => createOfferCard(offer)).join("");
  }
}

// Create request card HTML
function createRequestCard(request) {
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
        <span class="card-date">${new Date(request.created_at || Date.now()).toLocaleDateString("fr-FR")}</span>
      </div>
    </a>
  `
}

// Create offer card HTML
function createOfferCard(offer) {
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
        <span class="card-date">Par ${offer.auteur || 'Membre'}</span>
      </div>
    </a>
  `;
}


// Load all requests with filtering
async function loadRequests() {
  const container = document.getElementById("filteredRequestsContainer")
  if (!container) return

  const category = document.getElementById("categoryFilter")?.value || "";
  const quartier = document.getElementById("quartierFilter")?.value || "";
  const status = document.getElementById("statusFilter")?.value || "";
  const search = document.getElementById("searchFilter")?.value || "";

  // Build query string
  const params = new URLSearchParams();
  if (category) params.append('category_id', category); // Note: Backend expects ID, frontend sends name currently. Needs mapping or backend adjustment. Assuming text for now or ID if value is ID.
  if (quartier) params.append('quartier', quartier);
  if (status) params.append('status', status);
  if (search) params.append('q', search);

  const data = await fetchAPI(`/requests?${params.toString()}`);

  if (!data.ok || !data.requests || data.requests.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune demande ne correspond à vos critères.</p>'
    return
  }

  container.innerHTML = data.requests
    .map((request) => {
      const isFav = isFavorite(request.id, "request")
      return `
      <a href="request_view.html?id=${request.id}" class="card-horizontal">
        <div class="card-horizontal-content">
          <h4 class="card-horizontal-title">${request.title}</h4>
          <div class="card-horizontal-meta">
            <span>${request.category}</span>
            <span>📍 ${request.quartier}</span>
            <span>${new Date(request.created_at).toLocaleDateString("fr-FR")}</span>
          </div>
          <p class="card-horizontal-description">${request.description}</p>
        </div>
        <div class="card-horizontal-status">
          <span class="card-status ${request.status}">${request.status === "open" ? "Ouverte" : "Fermée"}</span>
          <span style="font-size: 12px; color: #999;">Par ${request.auteur}</span>
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
async function loadRequestDetails(requestId) {
  const container = document.getElementById("requestDetailsContainer")
  if (!container) return

  const data = await fetchAPI(`/requests/show?id=${requestId}`);
  
  if (!data.ok || !data.request) {
    container.innerHTML = '<p class="empty-state">Demande non trouvée.</p>'
    return
  }
  const request = data.request;
  const isOwner = authState.userId == request.user_id;

  container.innerHTML = `
    <h2>${request.title}</h2>
    <div class="request-detail-header">
      <div class="request-detail-meta">
        <span><strong>Catégorie:</strong> ${request.categorie || request.category_id}</span>
        <span><strong>Quartier:</strong> 📍 ${request.quartier}</span>
        <span><strong>Statut:</strong> ${request.status === "open" ? "✓ Ouverte" : "✗ Fermée"}</span>
        <span><strong>Date:</strong> ${new Date(request.created_at).toLocaleDateString("fr-FR")}</span>
      </div>
    </div>

    <div class="request-detail-user">
      <h4>Demandeur</h4>
      <div class="request-detail-user-info">
        <span><strong>${request.auteur}</strong></span>
        <!-- Ratings not implemented in backend yet -->
        <span>⭐ 5.0</span> 
        <span>📍 ${request.quartier}</span>
        <span>Membre</span>
      </div>
    </div>

    <div class="request-detail-description">
      <h4>Description</h4>
      <p>${request.description}</p>
    </div>

    <div class="request-detail-actions">
      ${!isOwner ? `<button class="btn btn-secondary" onclick="openContactForm(${request.user_id})">Contacter</button>` : ''}
      <button class="btn btn-secondary" onclick="viewUserProfile(${request.user_id})">Voir le profil</button>
      ${isOwner ? `<button class="btn btn-danger" onclick="deleteItem(${request.id}, 'request')">Supprimer ma demande</button>` : ''}
    </div>
  `
}

async function loadOfferDetails(offerId) {
  const container = document.getElementById("offerDetailsContainer");
  if (!container) return;

  const data = await fetchAPI(`/offers/show?id=${offerId}`);

  if (!data.ok || !data.offer) {
    container.innerHTML = '<p class="empty-state">Offre non trouvée.</p>';
    return;
  }
  const offer = data.offer;
  const isOwner = authState.userId == offer.user_id;

  container.innerHTML = `
    <h2>${offer.title}</h2>
    <div class="request-detail-header">
      <div class="request-detail-meta">
        <span><strong>Catégorie :</strong> ${offer.categorie || offer.category_id}</span>
        <span><strong>Quartier :</strong> 📍 ${offer.quartier}</span>
        <span><strong>Statut:</strong> ${offer.status === "active" ? "✓ Active" : "✗ Fermée"}</span>
      </div>
    </div>

    <div class="request-detail-user">
      <h4>Proposant</h4>
      <div class="request-detail-user-info">
        <span><strong>${offer.auteur}</strong></span>
        <span>⭐ 5.0</span>
        <span>📍 ${offer.quartier}</span>
        <span>Expert</span>
      </div>
    </div>

    <div class="request-detail-description">
      <h4>Description</h4>
      <p>${offer.description}</p>
    </div>

    <div class="request-detail-actions">
      ${!isOwner ? `<button class="btn btn-secondary" onclick="openContactForm(${offer.user_id})">Contacter</button>` : ''}
      <button class="btn btn-secondary" onclick="viewUserProfile(${offer.user_id})">Voir le profil</button>
      ${isOwner ? `<button class="btn btn-danger" onclick="deleteItem(${offer.id}, 'offer')">Supprimer mon offre</button>` : ''}
    </div>
  `;
}


// Load all offers
async function loadOffers() {
  const container = document.getElementById("offersListContainer");
  if (!container) return;

  // Récupération des filtres (si présents sur la page Offres)
  const categorySelect = document.getElementById("offerCategoryFilter");
  const quartierSelect = document.getElementById("offerQuartierFilter");
  const statusSelect = document.getElementById("offerStatusFilter");
  const searchInput = document.getElementById("offerSearchFilter");

  const category = categorySelect ? categorySelect.value : "";
  const quartier = quartierSelect ? quartierSelect.value : "";
  const status = statusSelect ? statusSelect.value : "";
  const search = searchInput ? searchInput.value.trim().toLowerCase() : "";

  const params = new URLSearchParams();
  if (category) params.append('category_id', category);
  if (quartier) params.append('quartier', quartier);
  if (status) params.append('status', status);
  if (search) params.append('q', search);

  const data = await fetchAPI(`/offers?${params.toString()}`);

  // Aucun résultat
  if (!data.ok || !data.offers || data.offers.length === 0) {
    container.innerHTML = `
      <p class="empty-state">
        Aucune offre ne correspond à vos critères.
      </p>
    `;
    return;
  }

  // Cartes cliquables
  container.innerHTML = data.offers
    .map((offer) => {
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
              <div style="font-size: 12px; color: #999; margin-top: 4px;">Par ${offer.auteur}</div>
            </div>
            <span class="card-date">⭐ 5.0</span>
          </div>
        </a>
      `;
    })
    .join("");
}



// Load conversations
async function loadConversations() {
  const container = document.getElementById("conversationsContainer")
  if (!container) return

  const data = await fetchAPI('/conversations');
  
  if (!data.ok || !data.conversations || data.conversations.length === 0) {
    container.innerHTML = '<p class="empty-state">Aucune conversation.</p>';
    return;
  }

  container.innerHTML = data.conversations
    .map(
      (conv) => `
    <div class="conversation-item" onclick="loadMessages(${conv.id}, '${conv.other_name.replace(/'/g, "\\'")}')">
        ${conv.other_name}
    </div>
  `,
    )
    .join("")

  // Check for URL param to open specific conversation
  const params = new URLSearchParams(window.location.search);
  const contactId = params.get('contact');
  if (contactId) {
      // Logic to find or create conversation would go here
      // For now, we just load the list
  }
}

// Load messages for a conversation
async function loadMessages(convId, title) {
  const container = document.getElementById("messagesContent")
  
  const data = await fetchAPI(`/messages?convId=${convId}`);

  // Mark conversation as active
  document.querySelectorAll(".conversation-item").forEach((item) => {
    item.classList.remove("active")
  })
  // Note: selector might need adjustment based on how onclick is rendered

  const messagesList = data.messages || [];

  container.innerHTML = `
    <div class="messages-header">
      <h4>${title || 'Conversation'}</h4>
    </div>
    <div class="messages-list">
      ${messagesList
        .map(
          (msg) => `
        <div class="message ${msg.sender_id == authState.userId ? "sent" : "received"}">
          <div class="message-bubble">${msg.text}</div>
          <span class="message-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
        </div>
      `,
        )
        .join("")}
    </div>
    <div class="message-input-group">
      <input type="text" id="msgInput" class="message-input" placeholder="Écrivez votre message...">
      <button class="btn btn-primary btn-sm" onclick="sendMessage(${convId})">Envoyer</button>
    </div>
  `;
  
  // Scroll to bottom
  const list = container.querySelector('.messages-list');
  list.scrollTop = list.scrollHeight;
}

async function sendMessage(convId) {
    const input = document.getElementById('msgInput');
    const text = input.value;
    if(!text) return;

    await fetchAPI('/messages', {
        method: 'POST',
        body: JSON.stringify({ convId: convId, text: text })
    });
    
    input.value = '';
    // Reload messages (simple way)
    const titleHeader = document.querySelector('.messages-header h4');
    loadMessages(convId, titleHeader ? titleHeader.innerText : '');
}

// Load user profile
async function loadProfile() {
  const container = document.getElementById("profileContainer")
  
  // Récupération des données réelles (profil + stats via les filtres)
  const [userData, requestsData, offersData] = await Promise.all([
    fetchAPI('/auth/me'),
    fetchAPI(`/requests?user_id=${authState.userId}`),
    fetchAPI(`/offers?user_id=${authState.userId}`)
  ]);

  const user = userData.user || {};
  const userRequests = requestsData.requests ? requestsData.requests.length : 0;
  const userOffers = offersData.offers ? offersData.offers.length : 0;

  container.innerHTML = `
    <div class="profile-header">
      <div class="profile-avatar">👤</div>
      <h2 class="profile-name">${user.full_name}</h2>
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
    </div>

    <div class="profile-section">
      <h3>Badge & Réputation</h3>
      <div style="padding: 16px 0;">
        <p><strong style="color: var(--primary);">⭐ Membre Actif</strong></p>
      </div>
    </div>
  `
}

async function loadPublicProfile(userId) {
  const container = document.getElementById("profileContainer");
  if (!container) return;

  const data = await fetchAPI(`/users/show?id=${userId}`);
  if (!data.ok) {
    container.innerHTML = `<p class="empty-state">Utilisateur introuvable.</p>`;
    return;
  }
  const user = data.user;

  // Tu peux adapter ce HTML pour qu'il ressemble exactement à ton profil actuel,
  // mais sans les boutons "Modifier mon profil" par exemple.
  container.innerHTML = `
    <div class="profile-header">
      <div>
        <h2>${user.full_name}</h2>
        <p>${user.role === 'admin' ? 'Administrateur' : 'Membre'}</p>
      </div>
      <div class="profile-rating">
        <span>⭐ Membre Actif</span>
        <span>${user.quartier}</span>
      </div>
    </div>

    <div class="profile-section">
      <h3>À propos</h3>
      <p>Membre depuis le ${new Date(user.created_at).toLocaleDateString("fr-FR")}</p>
    </div>

    <div class="profile-section">
      <h3>Informations de confiance</h3>
      <ul class="stats-list">
        <li><strong>Offres publiées :</strong> ${user.offers_count || 0}</li>
        <li><strong>Demandes effectuées :</strong> ${user.requests_count || 0}</li>
      </ul>
    </div>
  `;
}


// Admin functions
// Load admin dashboard for requests
async function loadAdminDashboard() {
  const container = document.getElementById("adminDashboardContainer")
  if (!container) return

  const data = await fetchAPI('/requests');
  const requestsList = data.requests || [];

  // Separate requests by status
  const openRequests = requestsList.filter((r) => r.status === "open")
  const pendingRequestsList = requestsList.filter((r) => r.status === "pending")
  const closedRequests = requestsList.filter((r) => r.status === "closed")

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
                  return `
                <div class="admin-item">
                  <div class="admin-item-content">
                    <h4>${request.title}</h4>
                    <p class="admin-item-meta">
                      <span>${request.category}</span>
                      <span>📍 ${request.quartier}</span>
                      <span>Par ${request.auteur}</span>
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
                  return `
                <div class="admin-item">
                  <div class="admin-item-content">
                    <h4>${request.title}</h4>
                    <p class="admin-item-meta">
                      <span>${request.category}</span>
                      <span>📍 ${request.quartier}</span>
                      <span>Par ${request.auteur}</span>
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
  // Appel API pour mettre à jour le statut
  fetchAPI('/requests/status', {
      method: 'POST',
      body: JSON.stringify({ id: requestId, status: 'open' })
  }).then(() => {
      loadAdminDashboard();
      alert(`Demande acceptée!`);
  });
}

// Admin function to reject a request
function rejectRequest(requestId) {
  if(!confirm("Rejeter cette demande ?")) return;
  
  fetchAPI(`/requests?id=${requestId}`, { method: 'DELETE' })
  .then(() => {
      loadAdminDashboard();
      alert("Demande rejetée.");
  });
}

// Admin function to close a request
function closeRequest(requestId) {
  fetchAPI('/requests/status', {
      method: 'POST',
      body: JSON.stringify({ id: requestId, status: 'closed' })
  }).then(() => {
      loadAdminDashboard();
      alert(`Demande fermée.`);
  });
}

// Load admin offers dashboard
async function loadAdminOffersDashboard() {
  const container = document.getElementById("adminOffersContainer")
  if (!container) return

  const data = await fetchAPI('/offers');
  const offersList = data.offers || [];

  container.innerHTML = `
    <div class="admin-header">
      <h2>Tableau de Bord Administrateur - Offres</h2>
      <p>Gérez et modérez les offres de services</p>
    </div>

    <div class="admin-stats">
      <div class="admin-stat-card">
        <div class="admin-stat-value">${offersList.length}</div>
        <div class="admin-stat-label">Offres Publiées</div>
      </div>
      <div class="admin-stat-card">
        <div class="admin-stat-value">${offersList.length}</div>
        <div class="admin-stat-label">Offres Approuvées</div>
      </div>
    </div>

    <div class="admin-section">
      <h3>Toutes les Offres (${offersList.length})</h3>
      <div class="admin-list">
        ${
          offersList.length === 0
            ? '<p class="empty-state">Aucune offre publiée.</p>'
            : offersList
                .map((offer) => {
                  return `
                <div class="admin-item">
                  <div class="admin-item-content">
                    <h4>${offer.title}</h4>
                    <p class="admin-item-meta">
                      <span>${offer.category}</span>
                      <span>📍 ${offer.quartier}</span>
                      <span>Par ${offer.auteur}</span>
                      <span>⭐ 5.0</span>
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

  const categories = [{id: 1, name: "Courses"}, {id: 2, name: "Déménagement"}, {id: 3, name: "Garde"}, {id: 4, name: "Informatique"}]; // Should fetch from API
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
            ${categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join("")}
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
async function submitCreateRequest(event) {
  event.preventDefault()

  const title = document.getElementById("requestTitle").value
  const category = document.getElementById("requestCategory").value
  const quartier = document.getElementById("requestQuartier").value
  const description = document.getElementById("requestDescription").value

  if (title && category && quartier && description) {
    await createRequest(title, category, quartier, description)
    alert(`Demande créée! Statut: En attente d'approbation administrateur`)
    window.location.href = "requests.html"
  }
}

// Load create offer form
function loadCreateOfferForm() {
  const container = document.getElementById("createOfferContainer")
  if (!container) return

  const categories = [{id: 1, name: "Éducation"}, {id: 2, name: "Informatique"}, {id: 3, name: "Services"}];
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
            ${categories.map((cat) => `<option value="${cat.id}">${cat.name}</option>`).join("")}
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
async function submitCreateOffer(event) {
  event.preventDefault()

  const title = document.getElementById("offerTitle").value
  const category = document.getElementById("offerCategory").value
  const quartier = document.getElementById("offerQuartier").value
  const description = document.getElementById("offerDescription").value

  if (title && category && quartier && description) {
    await createOffer(title, category, quartier, description)
    alert("Offre créée avec succès!")
    window.location.href = "offers.html"
  }
}

// Utility functions
async function openContactForm(userId) {
  // Redirect to messages with a parameter to start conversation
  window.location.href = `messages.html?contact=${userId}`;
}

function viewUserProfile(userId) {
  // On redirige vers profile.html en passant l'id de l'utilisateur dans l'URL
  window.location.href = `profile.html?userId=${userId}`;
}

async function deleteItem(id, type) {
  if(!confirm("Êtes-vous sûr de vouloir supprimer ?")) return;

  const endpoint = type === 'request' ? '/requests' : '/offers';
  const result = await fetchAPI(`${endpoint}?id=${id}`, { method: 'DELETE' });
  
  if(result.ok) {
    alert("Supprimé avec succès");
    window.location.href = type === 'request' ? 'requests.html' : 'offers.html';
  } else {
    alert("Erreur lors de la suppression");
  }
}

// Function to render authentication menu
function renderAuthMenu() {
  const authMenu = document.getElementById("authMenu")
  if (!authMenu) return

  if (isUserAuthenticated()) { // Assuming user name is stored or we fetch it
    const user = { name: "Mon Compte" }; // Simplified for menu
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

  // Gestion de la visibilité des liens de navigation (Protection)
  const navLinks = document.querySelectorAll('.nav-link');
  const isAuth = isUserAuthenticated();
  const protectedPages = ['requests.html', 'offers.html', 'messages.html', 'profile.html', 'dashboard.html'];

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // On vérifie si le lien pointe vers une page protégée
    const isProtected = protectedPages.some(page => href.includes(page));
    
    if (isProtected) {
      link.style.display = isAuth ? '' : 'none';
    }
  });

  // Gestion de la visibilité du lien Admin dans le menu
  const adminLink = document.querySelector('a[href*="admin"]');
  if (adminLink) {
    adminLink.style.display = isAdmin() ? 'block' : 'none';
  }

  // Masquer Dashboard et Profil pour l'administrateur
  if (isAdmin()) {
    const linksToHide = document.querySelectorAll('a[href*="dashboard.html"], a[href*="profile.html"]');
    linksToHide.forEach(link => link.style.display = 'none');
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

  /*const favoriteRequests = requests.filter((r) => isFavorite(r.id, "request"))
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
    })*/
    container.innerHTML = "<p>Favoris non connectés à l'API pour cette démo.</p>"
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

async function loadUserDashboard() {
  const container = document.getElementById("dashboardContainer")
  if (!container) return

  // Récupération des données réelles de l'utilisateur
  const [userData, requestsData, offersData] = await Promise.all([
    fetchAPI('/auth/me'),
    fetchAPI(`/requests?user_id=${authState.userId}`),
    fetchAPI(`/offers?user_id=${authState.userId}`)
  ]);

  const user = userData.user || {};
  const userRequests = requestsData.requests || [];
  const userOffers = offersData.offers || [];

  const pendingCount = userRequests.filter((r) => r.status === "pending").length;
  const activeCount = userRequests.filter((r) => r.status === "open").length;
  const completedCount = userRequests.filter((r) => r.status === "closed").length;

  container.innerHTML = `
    <div class="dashboard-header">
      <h2>Mon Tableau de Bord</h2>
      <p>Bienvenue, ${user.full_name}!</p>
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
          <h3>Actions Rapides</h3>
        </div>
        <div class="quick-actions">
          <a href="create-request.html" class="quick-action-btn">+ Créer une Demande</a>
          <a href="create-offer.html" class="quick-action-btn">+ Créer une Offre</a>
          <a href="favorites.html" class="quick-action-btn">❤️ Mes Favoris</a>
          <a href="notifications.html" class="quick-action-btn">🔔 Notifications</a>
        </div>
      </div>
    </div>`
}

// Call initialization on script load
initializeAuth()
renderAuthMenu()

// Auto-load dashboard if on dashboard page
document.addEventListener('DOMContentLoaded', () => {
  const dashboardContainer = document.getElementById('dashboardContainer');
  if (dashboardContainer && requireAuth()) {
    loadUserDashboard();
  }
});
