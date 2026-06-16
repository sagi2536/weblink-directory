/**
 * i18n.js — ระบบสองภาษา ไทย/อังกฤษ
 * ใช้ผ่าน data-i18n="key" ใน HTML และ t('key') ใน JS
 */
window.I18N = {
  th: {
    // ทั่วไป
    app_name: 'ระบบเก็บลิงค์เว็บแอปที่พัฒนา',
    nav_public: 'หน้าหลัก',
    nav_admin: 'แอดมิน',
    lang_switch: 'EN',
    search_placeholder: 'ค้นหาชื่อระบบ / ผู้พัฒนา / หมวดหมู่ / คำอธิบาย...',
    all_categories: 'ทุกหมวดหมู่',
    total_count: 'ทั้งหมด',
    items: 'รายการ',
    no_data: 'ยังไม่มีข้อมูล',
    no_result: 'ไม่พบรายการที่ค้นหา',
    loading: 'กำลังโหลด...',
    error_load: 'โหลดข้อมูลไม่สำเร็จ',

    // ฟิลด์
    f_name: 'ชื่อระบบ',
    f_webapp: 'ลิงค์ Web App',
    f_sheet: 'ลิงค์ Google Sheet',
    f_category: 'หมวดหมู่',
    f_owner: 'ผู้พัฒนา',
    f_description: 'คำอธิบาย',
    f_status: 'สถานะ',
    f_created: 'วันที่สร้าง',
    f_updated: 'วันที่แก้ไข',

    // การ์ด/ปุ่ม
    open_webapp: 'เปิดเว็บแอป',
    open_sheet: 'เปิดชีต',
    show_qr: 'QR Code',
    copy_link: 'คัดลอกลิงค์',
    copied: 'คัดลอกแล้ว!',
    download_qr: 'ดาวน์โหลด QR',
    close: 'ปิด',
    status_active: 'ใช้งาน',
    status_archived: 'เก็บถาวร',

    // แอดมิน
    admin_title: 'หน้าแอดมิน',
    login_title: 'เข้าสู่ระบบแอดมิน',
    password: 'รหัสผ่าน',
    login_btn: 'เข้าสู่ระบบ',
    logout: 'ออกจากระบบ',
    wrong_password: 'รหัสผ่านไม่ถูกต้อง',
    add_new: '+ เพิ่มรายการใหม่',
    edit: 'แก้ไข',
    del: 'ลบ',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    confirm_delete: 'ยืนยันการลบรายการนี้?',
    saved: 'บันทึกเรียบร้อย',
    deleted: 'ลบเรียบร้อย',
    save_error: 'บันทึกไม่สำเร็จ',
    required_name: 'กรุณากรอกชื่อระบบ',
    export_csv: 'ส่งออก CSV',
    form_add_title: 'เพิ่มรายการใหม่',
    form_edit_title: 'แก้ไขรายการ',
    actions: 'จัดการ',
    api_not_set: 'ยังไม่ได้ตั้งค่า API_URL ในไฟล์ assets/js/config.js'
  },
  en: {
    app_name: 'Developed Web App Link Directory',
    nav_public: 'Home',
    nav_admin: 'Admin',
    lang_switch: 'ไทย',
    search_placeholder: 'Search name / developer / category / description...',
    all_categories: 'All categories',
    total_count: 'Total',
    items: 'items',
    no_data: 'No data yet',
    no_result: 'No matching items',
    loading: 'Loading...',
    error_load: 'Failed to load data',

    f_name: 'System name',
    f_webapp: 'Web App link',
    f_sheet: 'Google Sheet link',
    f_category: 'Category',
    f_owner: 'Developer',
    f_description: 'Description',
    f_status: 'Status',
    f_created: 'Created',
    f_updated: 'Updated',

    open_webapp: 'Open Web App',
    open_sheet: 'Open Sheet',
    show_qr: 'QR Code',
    copy_link: 'Copy link',
    copied: 'Copied!',
    download_qr: 'Download QR',
    close: 'Close',
    status_active: 'Active',
    status_archived: 'Archived',

    admin_title: 'Admin Panel',
    login_title: 'Admin Login',
    password: 'Password',
    login_btn: 'Sign in',
    logout: 'Sign out',
    wrong_password: 'Incorrect password',
    add_new: '+ Add new item',
    edit: 'Edit',
    del: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    confirm_delete: 'Delete this item?',
    saved: 'Saved',
    deleted: 'Deleted',
    save_error: 'Save failed',
    required_name: 'Please enter the system name',
    export_csv: 'Export CSV',
    form_add_title: 'Add new item',
    form_edit_title: 'Edit item',
    actions: 'Actions',
    api_not_set: 'API_URL is not set in assets/js/config.js'
  }
};

(function () {
  const saved = localStorage.getItem('lang');
  window.CURRENT_LANG = saved || (window.APP_CONFIG && window.APP_CONFIG.DEFAULT_LANG) || 'th';
})();

function t(key) {
  const dict = window.I18N[window.CURRENT_LANG] || window.I18N.th;
  return dict[key] !== undefined ? dict[key] : key;
}

/** ใช้แปลทุก element ที่มี data-i18n และ data-i18n-ph (placeholder) */
function applyI18n() {
  document.documentElement.lang = window.CURRENT_LANG;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
  });
}

function toggleLang() {
  window.CURRENT_LANG = window.CURRENT_LANG === 'th' ? 'en' : 'th';
  localStorage.setItem('lang', window.CURRENT_LANG);
  applyI18n();
  document.dispatchEvent(new CustomEvent('langchange'));
}
