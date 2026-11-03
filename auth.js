/**
 * ============================================================================
 * mahadewa.id - Authentication & Access Control Script
 * Cab. Palopo
 * ============================================================================
 */

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzU0F715356lw2g1_5X8RW9so1GSE3QVNzO4CTrgl366pHXAd_5umSI-IYOPsTgdgIkvw/exec";

let currentUser = null;

// ----------------------------------------------------------------------------
// 1. PROSES LOGIN (Memanggil Backend Google Apps Script)
// ----------------------------------------------------------------------------
function handleLogin(usernameInput, passwordInput, callbackSuccess, callbackError) {
  const username = String(usernameInput || "").trim();
  const password = String(passwordInput || "").trim();

  if (!username || !password) {
    if (callbackError) callbackError("Username dan Password wajib diisi!");
    return;
  }

  // Menggunakan JSONP untuk menghindari kendala CORS pada Apps Script
  const callbackName = "cb_login_" + new Date().getTime();
  const url = `${SCRIPT_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&callback=${callbackName}`;

  window[callbackName] = function(response) {
    delete window[callbackName];
    document.body.removeChild(script);

    if (response && response.success) {
      // Simpan data user ke LocalStorage
      localStorage.setItem("mahadewa_user", JSON.stringify(response.user));
      currentUser = response.user;
      
      if (callbackSuccess) callbackSuccess(response.user);
    } else {
      if (callbackError) callbackError(response ? response.message : "Gagal terhubung ke server.");
    }
  };

  const script = document.createElement("script");
  script.src = url;
  script.onerror = function() {
    delete window[callbackName];
    document.body.removeChild(script);
    if (callbackError) callbackError("Gagal menghubungi server Apps Script.");
  };
  document.body.appendChild(script);
}

// ----------------------------------------------------------------------------
// 2. CEK AUTENTIKASI & KONTROL MENU NAVIGASI
// ----------------------------------------------------------------------------
function checkAuthAndRenderNav() {
  const session = localStorage.getItem("mahadewa_user");
  const currentPath = window.location.pathname;

  // Cek apakah halaman saat ini adalah index.html / root
  const isLoginPage = currentPath.endsWith("index.html") || currentPath === "/" || currentPath.endsWith("/");

  if (!session) {
    if (!isLoginPage) {
      window.location.href = "index.html";
    }
    return null;
  }

  try {
    currentUser = JSON.parse(session);
  } catch (e) {
    console.error("Sesi corrupt, menghapus data...");
    localStorage.removeItem("mahadewa_user");
    if (!isLoginPage) {
      window.location.href = "index.html";
    }
    return null;
  }

  // Jika user sudah login dan berada di halaman login (index.html), arahkan ke dashboard/halaman utama
  if (isLoginPage) {
    // Bisa diarahkan ke halaman utama pilihan Anda
    // window.location.href = "penjualan.html"; 
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

  // Ambil elemen navigasi sidebar/header
  const navPenjualan = document.getElementById("nav-penjualan");
  const navKeuangan = document.getElementById("nav-keuangan");
  const navSiplah = document.getElementById("nav-siplah");
  const navKebersihan = document.getElementById("nav-kebersihan");
  const navAbsensi = document.getElementById("nav-absensi"); // Element Navigasi Absensi
  const navAdminUsers = document.getElementById("nav-admin-users");

  const accPenjualan = hasAccess(akses.penjualan) || hasAccess(akses.PENJUALAN);
  const accKeuangan = hasAccess(akses.keuanganMtk) || hasAccess(akses.keuanganService) || hasAccess(akses.KEUANGAN_MTK) || hasAccess(akses.KEUANGAN_SERVICE);
  const accSiplah = hasAccess(akses.siplah) || hasAccess(akses.SIPLAH);
  const accKebersihan = hasAccess(akses.kebersihan) || hasAccess(akses.KEBERSIHAN);

  // Tampilkan / Sembunyikan Navigasi Menu
  if (navPenjualan) navPenjualan.style.display = (isUserAdmin || accPenjualan) ? "flex" : "none";
  if (navKeuangan) navKeuangan.style.display = (isUserAdmin || accKeuangan) ? "flex" : "none";
  if (navSiplah) navSiplah.style.display = (isUserAdmin || accSiplah) ? "flex" : "none";
  if (navKebersihan) navKebersihan.style.display = (isUserAdmin || accKebersihan) ? "flex" : "none";
  
  // Menu Absensi dapat diakses oleh semua staf yang terautentikasi
  if (navAbsensi) navAbsensi.style.display = "flex";

  // Menu Admin khusus untuk Role ADMIN
  if (navAdminUsers) navAdminUsers.style.display = isUserAdmin ? "flex" : "none";

  return currentUser;
}

// ----------------------------------------------------------------------------
// 3. UTILITAS LOGOUT & PROFIL
// ----------------------------------------------------------------------------
function handleLogout() {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    localStorage.removeItem("mahadewa_user");
    window.location.href = "index.html";
  }
}

function showProfile() {
  if (!currentUser) return;
  alert(`PROFIL SAYA:\nNama: ${currentUser.nama || '-'}\nUsername: ${currentUser.username || '-'}\nDivisi: ${currentUser.devisi || '-'}\nRole: ${currentUser.role || 'STAFF'}`);
}

// Jalankan otomatis pengecekan auth saat halaman selesai dibaca
document.addEventListener("DOMContentLoaded", function () {
  checkAuthAndRenderNav();
});
