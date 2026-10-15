// auth.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzC_FaMmWcqzY4SZSFPA3UL2xwIaqpjRU-RYGKpWmkLyC559qKL2Dnx4dSqSXuKVevgqw/exec";

let currentUser = null;

function checkAuthAndRenderNav() {
  const savedUser = localStorage.getItem("currentUser");
  if (!savedUser) {
    window.location.href = "index.html";
    return null;
  }
  
  currentUser = JSON.parse(savedUser);
  
  const userBadge = document.getElementById("userBadge");
  if (userBadge) {
    userBadge.innerText = `${currentUser.nama} (${currentUser.role})`;
  }

  const akses = currentUser.akses || {};
  
  setNavVisibility("nav-kebersihan", akses.kebersihan);
  setNavVisibility("nav-audit-kebersihan", akses.auditKebersihan);
  setNavVisibility("nav-kpi-kebersihan", akses.kpiKebersihan);
  setNavVisibility("nav-penjualan", akses.penjualan);
  setNavVisibility("nav-marketing", akses.penjualan);
  setNavVisibility("nav-keuangan", akses.keuanganMtk || akses.keuanganService);
  setNavVisibility("nav-siplah", akses.siplah);

  return currentUser;
}

function setNavVisibility(id, isAllowed) {
  const el = document.getElementById(id);
  if (el) {
    el.style.display = isAllowed ? "flex" : "none";
  }
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function showProfile() {
  if (!currentUser) {
    alert("Belum ada sesi login terdeteksi.");
    return;
  }
  alert(`=== PROFIL USER ===\n\nNama: ${currentUser.nama}\nUsername: ${currentUser.username}\nRole: ${currentUser.role}`);
}
