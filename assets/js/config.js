/**
 * config.js — ค่าตั้งต้นของฝั่งเว็บ
 *
 * ⚠️ สำคัญ: หลัง deploy Apps Script เป็น Web App แล้ว
 * ให้คัดลอก URL ที่ลงท้ายด้วย /exec มาวางที่ API_URL ด้านล่าง
 */
window.APP_CONFIG = {
  // วาง URL ของ Web App (ลงท้ายด้วย /exec) ที่นี่
  API_URL: 'https://script.google.com/macros/s/AKfycbwMZxRj-YMHZfWQFGSDfFjMnQ_3UMIQcTLxOF3d5sIJXZlL_qcv9j2ozlb3CBotRPTs/exec',

  // ชื่อแอป (แสดงบนหัวเว็บ) — ปรับได้
  APP_NAME_TH: 'ระบบเก็บลิงค์เว็บแอปที่พัฒนา',
  APP_NAME_EN: 'Developed Web App Link Directory',

  // ภาษาเริ่มต้น: 'th' หรือ 'en'
  DEFAULT_LANG: 'th'
};
