// Simple client-side account system backed by the browser's localStorage.
// Passwords are stored as SHA-256 hashes, never as plain text.
const USERS_KEY = "semi_users";
const SESSION_KEY = "semi_session";

async function hashPassword(password) {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Make sure the default administrator (admin / 123) always exists.
async function ensureDefaultAdmin() {
  const users = loadUsers();
  if (!users.some((u) => u.username === "admin")) {
    users.unshift({
      username: "admin",
      fullName: "System Administrator",
      email: "admin@semi.local",
      role: "admin",
      passwordHash: await hashPassword("123"),
      createdAt: new Date().toISOString(),
      isDefault: true,
    });
    saveUsers(users);
  }
}

async function registerAccount({ username, fullName, email, password, role }) {
  await ensureDefaultAdmin();
  username = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    throw new Error("Username must be 3–20 characters (letters, numbers, underscore).");
  }
  if (!fullName.trim()) throw new Error("Full name is required.");
  if (password.length < 3) throw new Error("Password must be at least 3 characters.");
  const users = loadUsers();
  if (users.some((u) => u.username === username)) {
    throw new Error("That username is already taken.");
  }
  users.push({
    username,
    fullName: fullName.trim(),
    email: email.trim(),
    role: role === "admin" ? "admin" : "user",
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  });
  saveUsers(users);
}

async function login(username, password) {
  await ensureDefaultAdmin();
  username = username.trim().toLowerCase();
  const hash = await hashPassword(password);
  const user = loadUsers().find((u) => u.username === username && u.passwordHash === hash);
  if (!user) throw new Error("Invalid username or password.");
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: user.username, role: user.role }));
  return user;
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

function currentUser() {
  try {
    const s = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!s) return null;
    return loadUsers().find((u) => u.username === s.username) || null;
  } catch {
    return null;
  }
}

// Redirect away from a page if the visitor lacks the required role.
function requireRole(role) {
  const user = currentUser();
  if (!user) {
    window.location.replace("login.html");
    return null;
  }
  if (role === "admin" && user.role !== "admin") {
    window.location.replace("dashboard.html");
    return null;
  }
  return user;
}

function deleteAccount(username) {
  saveUsers(loadUsers().filter((u) => u.username !== username || u.isDefault));
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Update the nav bar to reflect login state.
function renderNav() {
  const slot = document.getElementById("nav-auth");
  if (!slot) return;
  const user = currentUser();
  if (user) {
    const home = user.role === "admin" ? "admin.html" : "dashboard.html";
    slot.innerHTML =
      `<a href="${home}">${user.role === "admin" ? "Admin Panel" : "Dashboard"}</a>` +
      `<a href="#" id="logout-link" class="btn btn-small">Logout</a>`;
    document.getElementById("logout-link").addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  } else {
    slot.innerHTML = `<a href="login.html">Login</a><a href="register.html" class="btn btn-small">Register</a>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ensureDefaultAdmin();
  renderNav();
  const toggle = document.querySelector(".nav-toggle");
  if (toggle) toggle.addEventListener("click", () => document.querySelector(".nav-links").classList.toggle("open"));
});
