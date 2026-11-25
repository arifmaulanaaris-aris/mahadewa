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
    if (script.parentNode) document.body.removeChild(script);

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
    if (script.parentNode) document.body.removeChild(script);
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

  applyNavVisibility(currentUser);

  // Sinkronisasi hak akses terbaru dari server di latar belakang
  if (!isLoginPage && currentUser && currentUser.username) {
    syncUserPermissions(currentUser.username);
  }

  return currentUser;
}

// Menerapkan tampilan menu berdasarkan role & hak akses user
function applyNavVisibility(user) {
  if (!user) return;

  const badge = document.getElementById("userBadge");
  if (badge) {
    badge.innerText = `${(user.nama || user.username || '').toUpperCase()} (${(user.role || 'STAFF').toUpperCase()})`;
  }

  const hasAccess = (val) => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.trim().toUpperCase() === "YA" || val.trim().toUpperCase() === "TRUE";
    return false;
  };

  const isUserAdmin = (user.role || "").toUpperCase() === "ADMIN";
  const akses = user.akses || {};

  // Ambil elemen navigasi sidebar desktop & mobile
  const navPenjualan = document.getElementById("nav-penjualan");
  const navPenjualanMb = document.getElementById("nav-penjualan-mb");
  const navPromotor = document.getElementById("nav-promotor");
  const navPromotorMb = document.getElementById("nav-promotor-mb");
  const navKeuangan = document.getElementById("nav-keuangan");
  const navKeuanganMb = document.getElementById("nav-keuangan-mb");
  const navSiplah = document.getElementById("nav-siplah");
  const navSiplahMb = document.getElementById("nav-siplah-mb");
  const navKebersihan = document.getElementById("nav-kebersihan");
  const navKebersihanMb = document.getElementById("nav-kebersihan-mb");
  const navAbsensi = document.getElementById("nav-absensi");
  const navAbsensiMb = document.getElementById("nav-absensi-mb");
  const navLpj = document.getElementById("nav-lpj");
  const navLpjMb = document.getElementById("nav-lpj-mb");
  const navProfil = document.getElementById("nav-profil");
  const navProfilMb = document.getElementById("nav-profil-mb");
  const navAdminUsers = document.getElementById("nav-admin-users");
  const navAdminUsersMb = document.getElementById("nav-admin-users-mb");

  const accPenjualan = hasAccess(akses.penjualan) || hasAccess(akses.PENJUALAN);
  const accPromotor = hasAccess(akses.promotor) || hasAccess(akses.PROMOTOR);
  const accKeuangan = hasAccess(akses.keuanganMtk) || hasAccess(akses.keuanganService) || hasAccess(akses.KEUANGAN_MTK) || hasAccess(akses.KEUANGAN_SERVICE);
  const accSiplah = hasAccess(akses.siplah) || hasAccess(akses.SIPLAH);
  const accKebersihan = hasAccess(akses.kebersihan) || hasAccess(akses.KEBERSIHAN);

  // Tampilkan / Sembunyikan Navigasi Menu Desktop
  if (navPenjualan) navPenjualan.style.display = (isUserAdmin || accPenjualan) ? "flex" : "none";
  if (navPromotor) navPromotor.style.display = (isUserAdmin || accPromotor) ? "flex" : "none";
  if (navKeuangan) navKeuangan.style.display = (isUserAdmin || accKeuangan) ? "flex" : "none";
  if (navSiplah) navSiplah.style.display = (isUserAdmin || accSiplah) ? "flex" : "none";
  if (navKebersihan) navKebersihan.style.display = (isUserAdmin || accKebersihan) ? "flex" : "none";
  if (navAbsensi) navAbsensi.style.display = "flex";
  if (navLpj) navLpj.style.display = "flex";
  if (navProfil) navProfil.style.display = "flex";
  if (navAdminUsers) navAdminUsers.style.display = isUserAdmin ? "flex" : "none";

  // Tampilkan / Sembunyikan Navigasi Menu Mobile
  if (navPenjualanMb) navPenjualanMb.style.display = (isUserAdmin || accPenjualan) ? "inline-block" : "none";
  if (navPromotorMb) navPromotorMb.style.display = (isUserAdmin || accPromotor) ? "inline-block" : "none";
  if (navKeuanganMb) navKeuanganMb.style.display = (isUserAdmin || accKeuangan) ? "inline-block" : "none";
  if (navSiplahMb) navSiplahMb.style.display = (isUserAdmin || accSiplah) ? "inline-block" : "none";
  if (navKebersihanMb) navKebersihanMb.style.display = (isUserAdmin || accKebersihan) ? "inline-block" : "none";
  if (navAbsensiMb) navAbsensiMb.style.display = "inline-block";
  if (navLpjMb) navLpjMb.style.display = "inline-block";
  if (navProfilMb) navProfilMb.style.display = "inline-block";
  if (navAdminUsersMb) navAdminUsersMb.style.display = isUserAdmin ? "inline-block" : "none";

  return currentUser;
}

// ----------------------------------------------------------------------------
// 3. UTILITAS LOGOUT & PROFIL
// ----------------------------------------------------------------------------
function handleLogout() {
  localStorage.removeItem("mahadewa_user");
  window.location.href = "index.html";
}

function showProfile() {
  if (!currentUser) return;
  const info = `PROFIL SAYA: Nama: ${currentUser.nama || '-'} | Username: ${currentUser.username || '-'} | Divisi: ${currentUser.devisi || '-'} | Role: ${currentUser.role || 'STAFF'}`;
  if (typeof showToast === "function") {
    showToast(info);
  } else {
    console.log(info);
  }
}

// Jalankan otomatis pengecekan auth saat halaman selesai dibaca
document.addEventListener("DOMContentLoaded", function () {
  checkAuthAndRenderNav();
});
