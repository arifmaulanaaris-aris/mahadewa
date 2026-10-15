const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU0F715356lw2g1_5X8RW9so1GSE3QVNzO4CTrgl366pHXAd_5umSI-IYOPsTgdgIkvw/exec"; // Sesuaikan URL Apps Script Anda

let currentUser = null;

function checkAuthAndRenderNav() {
  const session = localStorage.getItem("mahadewa_user");
  if (!session) {
    // Mencegah infinite loop jika sudah di halaman index.html
    if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") {
      window.location.href = "index.html";
    }
    return null;
  }

  try {
    currentUser = JSON.parse(session);
  } catch (e) {
    console.error("Data sesi corrupt, menghapus sesi...");
    localStorage.removeItem("mahadewa_user");
    window.location.href = "index.html";
    return null;
  }

  // Set User Badge di Header jika elemen ditemukan
  const badge = document.getElementById("userBadge");
  if (badge) {
    badge.innerText = `${(currentUser.nama || currentUser.username || '').toUpperCase()} (${(currentUser.role || 'STAFF').toUpperCase()})`;
  }

  // Helper untuk mengecek akses dengan aman (mendukung boolean true / string "YA")
  const hasAccess = (val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.trim().toUpperCase() === "YA";
    return false;
  };

  const isUserAdmin = (currentUser.role || "").toUpperCase() === "ADMIN";
  const akses = currentUser.akses || {};

  // Tampilkan / Sembunyikan Navigasi Menu berdasarkan Hak Akses
  const navPenjualan = document.getElementById("nav-penjualan");
  const navKeuangan = document.getElementById("nav-keuangan");
  const navSiplah = document.getElementById("nav-siplah");
  const navKebersihan = document.getElementById("nav-kebersihan");
  const navAdminUsers = document.getElementById("nav-admin-users");

  if (navPenjualan) navPenjualan.style.display = (isUserAdmin || hasAccess(akses.penjualan)) ? "flex" : "none";
  if (navKeuangan) navKeuangan.style.display = (isUserAdmin || hasAccess(akses.keuanganMtk) || hasAccess(akses.keuanganService)) ? "flex" : "none";
  if (navSiplah) navSiplah.style.display = (isUserAdmin || hasAccess(akses.siplah)) ? "flex" : "none";
  if (navKebersihan) navKebersihan.style.display = (isUserAdmin || hasAccess(akses.kebersihan)) ? "flex" : "none";
  if (navAdminUsers) navAdminUsers.style.display = isUserAdmin ? "flex" : "none";

  return currentUser;
}

function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    localStorage.removeItem("mahadewa_user");
    window.location.href = "index.html";
  }
}

function showProfile() {
  if (!currentUser) return;
  alert(`PROFIL SAYA:\nNama: ${currentUser.nama || '-'}\nUsername: ${currentUser.username || '-'}\nDevisi: ${currentUser.devisi || '-'}\nRole: ${currentUser.role || 'STAFF'}`);
}
