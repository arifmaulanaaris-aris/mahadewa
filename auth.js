// auth.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU0F715356lw2g1_5X8RW9so1GSE3QVNzO4CTrgl366pHXAd_5umSI-IYOPsTgdgIkvw/exec";

let currentUser = null;

function checkAuthAndRenderNav() {
  const savedUser = localStorage.getItem("currentUser");
  
  if (!savedUser) {
    window.location.href = "index.html";
    return null;
  }
  
  try {
    currentUser = JSON.parse(savedUser);
  } catch (e) {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
    return null;
  }

  // Ambil nama dari berbagai kemungkinan field nama yang dikirim backend
  const displayName = currentUser.nama || currentUser.NAMA || currentUser.username || currentUser.USER_NAME || "User";
  const displayRole = currentUser.role || currentUser.ROLE || "STAFF";
  
  // Tampilkan Nama & Role resmi di header badge
  const userBadge = document.getElementById("userBadge");
  if (userBadge) {
    userBadge.innerText = `${displayName} (${displayRole})`;
  }

  // Atur visibilitas menu sidebar berdasarkan hak akses sheet AKUN
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
  sessionStorage.clear();
  window.location.href = "index.html";
}

function showProfile() {
  if (!currentUser) {
    alert("Belum ada sesi login aktif.");
    return;
  }
  const displayName = currentUser.nama || currentUser.NAMA || currentUser.username;
  const displayRole = currentUser.role || currentUser.ROLE || "STAFF";
  
  alert(`=== PROFIL USER ===\n\nNama: ${displayName}\nUsername: ${currentUser.username || '-'}\nRole: ${displayRole}`);
}
