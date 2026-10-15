// auth.js
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzC_FaMmWcqzY4SZSFPA3UL2xwIaqpjRU-RYGKpWmkLyC559qKL2Dnx4dSqSXuKVevgqw/exec";

let currentUser = null;

// Fungsi untuk memeriksa autentikasi sesi login saat halaman dimuat
function checkAuthAndRenderNav() {
  const savedUser = localStorage.getItem("currentUser");
  
  if (!savedUser) {
    // Jika tidak ada data login, paksa kembali ke index.html
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
  
  // Tampilkan nama & role di header badge jika elemen tersedia
  const userBadge = document.getElementById("userBadge");
  if (userBadge) {
    userBadge.innerText = `${currentUser.nama} (${currentUser.role})`;
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

// FUNGSI LOGOUT (TOMBOL KELUAR)
function handleLogout() {
  // Hapus semua data sesi tersimpan
  localStorage.clear();
  sessionStorage.clear();
  
  // Lempar kembali ke halaman login (index.html)
  window.location.href = "index.html";
}

// FUNGSI TAMPILKAN PROFIL
function showProfile() {
  if (!currentUser) {
    alert("Belum ada sesi login aktif.");
    return;
  }
  alert(`=== PROFIL USER ===\n\nNama: ${currentUser.nama}\nUsername: ${currentUser.username}\nRole: ${currentUser.role}`);
}
