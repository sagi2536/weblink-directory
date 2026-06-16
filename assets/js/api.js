/**
 * api.js — ตัวกลางเรียก Google Apps Script Web App API
 *
 * - อ่าน (list): ใช้ GET
 * - เขียน (add/update/delete/login): ใช้ POST แบบ text/plain
 *   เพื่อเลี่ยง CORS preflight (OPTIONS) ที่ Apps Script ไม่รองรับ
 */
const API = (function () {
  function getUrl() {
    const url = window.APP_CONFIG && window.APP_CONFIG.API_URL;
    if (!url || url.indexOf('PASTE_') === 0) {
      throw new Error(t('api_not_set'));
    }
    return url;
  }

  async function list() {
    const res = await fetch(getUrl() + '?action=list', { method: 'GET' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'ERROR');
    return json.data;
  }

  /** ส่งคำสั่งเขียน — body เป็น text/plain เพื่อเป็น simple request */
  async function post(action, payload, password) {
    const body = JSON.stringify({ action: action, payload: payload, password: password });
    const res = await fetch(getUrl(), {
      method: 'POST',
      // ไม่ตั้ง Content-Type application/json โดยตั้งใจ (กัน preflight)
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: body
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'ERROR');
    return json;
  }

  return {
    list: list,
    login: (password) => post('login', {}, password),
    add: (payload, password) => post('add', payload, password),
    update: (payload, password) => post('update', payload, password),
    remove: (id, password) => post('delete', { id: id }, password)
  };
})();
