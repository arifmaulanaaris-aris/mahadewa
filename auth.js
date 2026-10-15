const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6v_S4Gk66BspLzR1K5hC-Sg0eF2N9349884705342111/exec"; // Sesuaikan URL Apps Script Anda

let currentUser = null;

function checkAuthAndRenderNav() {
  const session = localStorage.getItem("mahadewa_user");
  if (!session) {
    window.location.href = "index.html";
    return null;
  }

  currentUser = JSON.parse(session);

  // Set User Badge di Header
  const badge = document.getElementById("userBadge");
  if (badge) {
    badge.innerText = `${(currentUser.nama || currentUser.username).toUpperCase()} (${currentUser.role || 'STAFF'})`;
  }

  // Tampilkan / Sembunyikan Navigasi Menu berdasarkan Akses
  const navPenjualan = document.getElementById("nav-penjualan");
  const navKeuangan = document.getElementById("nav-keuangan");
  const navSiplah = document.getElementById("nav-siplah");
  const navKebersihan = document.getElementById("nav-kebersihan");
  const navAdminUsers = document.getElementById("nav-admin-users");

  const isUserAdmin = (currentUser.role || "").toUpperCase() === "ADMIN";

  if (navPenjualan) navPenjualan.style.display = (isUserAdmin || currentUser.akses?.penjualan) ? "flex" : "none";
  if (navKeuangan) navKeuangan.style.display = (isUserAdmin || currentUser.akses?.keuanganMtk || currentUser.akses?.keuanganService) ? "flex" : "none";
  if (navSiplah) navSiplah.style.display = (isUserAdmin || currentUser.akses?.siplah) ? "flex" : "none";
  if (navKebersihan) navKebersihan.style.display = (isUserAdmin || currentUser.akses?.kebersihan) ? "flex" : "none";
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
  alert(`PROFIL SAYA:\nNama: ${currentUser.nama}\nUsername: ${currentUser.username}\nDevisi: ${currentUser.devisi || '-'}\nRole: ${currentUser.role}`);
}
