const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU0F715356lw2g1_5X8RW9so1GSE3QVNzO4CTrgl366pHXAd_5umSI-IYOPsTgdgIkvw/exec";

let currentUser = null;

function checkAuthAndRenderNav() {
  const session = localStorage.getItem("mahadewa_user");
  const currentPath = window.location.pathname;

  if (!session) {
    if (!currentPath.endsWith("index.html") && currentPath !== "/") {
      window.location.href = "index.html";
    }
    return null;
  }

  try {
    currentUser = JSON.parse(session);
  } catch (e) {
    console.error("Sesi corrupt, menghapus data...");
    localStorage.removeItem("mahadewa_user");
    if (!currentPath.endsWith("index.html") && currentPath !== "/") {
      window.location.href = "index.html";
    }
    return null;
  }

  // Set User Badge di Header
  const badge = document.getElementById("userBadge");
  if (badge) {
    badge.innerText = `${(currentUser.nama || currentUser.username || '').toUpperCase()} (${(currentUser.role || 'STAFF').toUpperCase()})`;
  }

  // Helper cek akses fleksibel
  const hasAccess = (val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.trim().toUpperCase() === "YA" || val.trim().toUpperCase() === "TRUE";
    return false;
  };

  const isUserAdmin = (currentUser.role || "").toUpperCase() === "ADMIN";
  const akses = currentUser.akses || {};

  // Tampilkan / Sembunyikan Navigasi Menu Utama di Sidebar
  const navPenjualan = document.getElementById("nav-penjualan");
  const navKeuangan = document.getElementById("nav-keuangan");
  const navSiplah = document.getElementById("nav-siplah");
  const navKebersihan = document.getElementById("nav-kebersihan");
  const navAdminUsers = document.getElementById("nav-admin-users");

  const accPenjualan = hasAccess(akses.penjualan) || hasAccess(akses.PENJUALAN);
  const accKeuangan = hasAccess(akses.keuanganMtk) || hasAccess(akses.keuanganService) || hasAccess(akses.KEUANGAN_MTK) || hasAccess(akses.KEUANGAN_SERVICE);
  const accSiplah = hasAccess(akses.siplah) || hasAccess(akses.SIPLAH);
  const accKebersihan = hasAccess(akses.kebersihan) || hasAccess(akses.KEBERSIHAN);

  if (navPenjualan) navPenjualan.style.display = (isUserAdmin || accPenjualan) ? "flex" : "none";
  if (navKeuangan) navKeuangan.style.display = (isUserAdmin || accKeuangan) ? "flex" : "none";
  if (navSiplah) navSiplah.style.display = (isUserAdmin || accSiplah) ? "flex" : "none";
  if (navKebersihan) navKebersihan.style.display = (isUserAdmin || accKebersihan) ? "flex" : "none";
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
