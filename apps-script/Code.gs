/**
 * Code.gs — Web App entry point (JSON API)
 *
 * Frontend อยู่บน GitHub Pages และเรียก API นี้ข้ามโดเมนผ่าน fetch
 * จึงใช้ ContentService ส่ง JSON กลับ (ไม่ใช่ HtmlService)
 *
 * รูปแบบการเรียก:
 *   - อ่าน  : GET  ?action=list            -> { ok:true, data:[...] }
 *   - เขียน : POST body JSON {action, password, payload}
 *             action = add | update | delete
 *
 * หมายเหตุ CORS: ส่ง body แบบ text/plain จากฝั่ง client เพื่อเลี่ยง preflight (OPTIONS)
 * ซึ่ง Apps Script ไม่รองรับ — ดูตัวอย่างใน assets/js/api.js
 */

/** GET: ใช้สำหรับอ่านข้อมูล (list) และทดสอบสถานะ */
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'list';
    if (action === 'list') {
      return jsonOut_({ ok: true, data: listLinks_() });
    }
    if (action === 'ping') {
      return jsonOut_({ ok: true, message: 'API is running' });
    }
    return jsonOut_({ ok: false, error: 'UNKNOWN_ACTION' });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err && err.message || err) });
  }
}

/** POST: ใช้สำหรับ add / update / delete (ต้องมีรหัสผ่าน) และ list ก็ได้ */
function doPost(e) {
  try {
    let req = {};
    if (e && e.postData && e.postData.contents) {
      req = JSON.parse(e.postData.contents);
    }
    const action = req.action || '';

    // อ่านได้โดยไม่ต้องใช้รหัสผ่าน
    if (action === 'list') {
      return jsonOut_({ ok: true, data: listLinks_() });
    }

    // ตรวจรหัสผ่านสำหรับการเขียนทุกชนิด
    if (!checkPassword_(req.password)) {
      return jsonOut_({ ok: false, error: 'UNAUTHORIZED' });
    }

    if (action === 'login') {
      // ใช้ตรวจรหัสผ่านตอนเข้าหน้าแอดมิน
      return jsonOut_({ ok: true, message: 'OK' });
    }
    if (action === 'add') {
      const rec = addLink_(req.payload || {});
      return jsonOut_({ ok: true, data: rec });
    }
    if (action === 'update') {
      const rec = updateLink_(req.payload || {});
      return jsonOut_({ ok: true, data: rec });
    }
    if (action === 'delete') {
      deleteLink_((req.payload && req.payload.id) || req.id);
      return jsonOut_({ ok: true });
    }
    return jsonOut_({ ok: false, error: 'UNKNOWN_ACTION' });
  } catch (err) {
    const msg = String(err && err.message || err);
    return jsonOut_({ ok: false, error: msg });
  }
}

/** เปรียบเทียบรหัสผ่านกับค่าใน Script Properties */
function checkPassword_(input) {
  const stored = PropertiesService.getScriptProperties().getProperty(PROP_ADMIN_PASSWORD);
  if (!stored) return false;
  return String(input || '') === String(stored);
}

/** ส่ง JSON response */
function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * รันฟังก์ชันนี้หนึ่งครั้งเพื่อตั้งรหัสผ่านแอดมิน
 * แก้ค่า 'เปลี่ยนรหัสนี้' เป็นรหัสที่ต้องการก่อนกด Run
 */
function setupAdminPassword() {
  PropertiesService.getScriptProperties()
    .setProperty(PROP_ADMIN_PASSWORD, 'เปลี่ยนรหัสนี้');
  Logger.log('ตั้งรหัสผ่านแอดมินเรียบร้อย');
}

/** รันครั้งแรกเพื่อสร้างชีตพร้อมหัวคอลัมน์ (ไม่บังคับ ระบบสร้างให้อัตโนมัติอยู่แล้ว) */
function setupSheet() {
  getDataSheet_();
  Logger.log('สร้าง/ตรวจสอบชีต "' + SHEET_NAME + '" เรียบร้อย');
}
