/**
 * theme.js — สลับธีม Light/Dark + จำค่าไว้ใน localStorage
 * ตั้ง data-theme บน <html> ทันทีที่โหลด (โหลดไฟล์นี้ใน <head>) เพื่อกัน flash ตอนเปิดหน้า
 */
(function () {
  var saved = localStorage.getItem('theme') || 'dark'; // ค่าเริ่มต้น = dark
  document.documentElement.setAttribute('data-theme', saved);
})();

function toggleTheme() {
  var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  syncThemeBtn();
}

function syncThemeBtn() {
  var btn = document.getElementById('themeBtn');
  if (!btn) return;
  var isLight = document.documentElement.getAttribute('data-theme') === 'light';
  // แสดงไอคอนของธีมที่จะสลับไป
  btn.textContent = isLight ? '🌙' : '☀️';
  btn.setAttribute('aria-label', isLight ? 'สลับเป็นโหมดมืด' : 'สลับเป็นโหมดสว่าง');
  btn.setAttribute('title', isLight ? 'โหมดมืด' : 'โหมดสว่าง');
}

document.addEventListener('DOMContentLoaded', function () {
  syncThemeBtn();
  var btn = document.getElementById('themeBtn');
  if (btn) btn.addEventListener('click', toggleTheme);
});
