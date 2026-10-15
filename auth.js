// auth.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzC_FaMmWcqzY4SZSFPA3UL2xwIaqpjRU-RYGKpWmkLyC559qKL2Dnx4dSqSXuKVevgqw/exec";

let currentUser = null;

function checkAuthAndRenderNav() {
  const savedUser = localStorage.getItem("currentUser");
  if (!savedUser) {
    // Jika belum login, kembalikan ke halaman index.html
    window.location.href = "index.html";
    return null;
  }
  
  currentUser = JSON.parse(savedUser);
  
  // Update badge nama pengguna di header
  const userBadge = document.getElementById("userBadge");
  if (userBadge) {
    userBadge.innerText = `${currentUser.nama} (${currentUser.role})`;
  }

  // Atur visibilitas menu navigasi berdasarkan hak akses dari sheet AKUN
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
  localStorage.removeItem("currentUser");
  window.location.href = "index.html";
}

function showProfile() {
  if (!currentUser) return;
  alert(`=== PROFIL USER ===\n\nNama: ${currentUser.nama}\nUsername: ${currentUser.username}\nRole: ${currentUser.role}`);
}
