/**
 * Data.gs — Data Access Layer
 * ทุกฟังก์ชันที่อ่าน/เขียน Google Sheet อยู่ที่นี่ที่เดียว
 * อ่าน/เขียนแบบ batch และอ้างอิงคอลัมน์ผ่าน header map (กันหัวคอลัมน์ภาษาไทยเพี้ยน)
 */

/** คืนค่า object ของชีตข้อมูล สร้างใหม่พร้อมหัวคอลัมน์ถ้ายังไม่มี */
function getDataSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** สร้าง map: logical field name -> column index จากแถวหัว (normalize ช่องว่าง) */
function buildHeaderMap_(headerRow) {
  // หัวจริงในชีตอาจถูกแก้เป็นภาษาไทย เราจึง map ตามตำแหน่งกับ FIELDS
  // โดยถือว่าลำดับคอลัมน์ตรงกับ FIELDS เสมอ (เขียนเองครั้งแรกจาก HEADERS)
  const map = {};
  FIELDS.forEach((f, i) => { map[f] = i; });
  // เผื่อกรณีหัวถูกสลับ: ถ้าเจอหัวที่ตรงกับ HEADERS ให้ override index ตามจริง
  headerRow.forEach((h, i) => {
    const key = String(h).trim().replace(/\s+/g, ' ');
    const idx = HEADERS.indexOf(key);
    if (idx > -1) map[FIELDS[idx]] = i;
  });
  return map;
}

/** อ่านข้อมูลทั้งหมดเป็น array ของ object */
function listLinks_() {
  const sheet = getDataSheet_();
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const col = buildHeaderMap_(values[0]);
  const rows = values.slice(1);
  const out = [];
  rows.forEach(r => {
    const id = String(r[col['id']] || '').trim();
    if (!id) return; // ข้ามแถวว่าง
    out.push(rowToObject_(r, col));
  });
  return out;
}

/** แปลงแถว (array) เป็น object ตาม FIELDS โดยแปลง Date เป็น ISO string */
function rowToObject_(r, col) {
  const obj = {};
  FIELDS.forEach(f => {
    let v = r[col[f]];
    if (v instanceof Date) v = v.toISOString();
    obj[f] = (v === null || v === undefined) ? '' : String(v);
  });
  return obj;
}

/** หาเลขแถว (1-based) จาก id; คืน -1 ถ้าไม่พบ */
function findRowById_(sheet, id) {
  const values = sheet.getDataRange().getValues();
  const col = buildHeaderMap_(values[0]);
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][col['id']]).trim() === String(id).trim()) {
      return i + 1; // +1 เพราะ index 0 = แถว 1
    }
  }
  return -1;
}

/** เพิ่มลิงค์ใหม่ คืน object ที่เพิ่ม */
function addLink_(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getDataSheet_();
    const now = new Date().toISOString();
    const rec = {
      id: Utilities.getUuid(),
      name: clean_(payload.name),
      webAppUrl: clean_(payload.webAppUrl),
      sheetUrl: clean_(payload.sheetUrl),
      category: clean_(payload.category),
      owner: clean_(payload.owner),
      description: clean_(payload.description),
      status: clean_(payload.status) || 'active',
      createdAt: now,
      updatedAt: now
    };
    const row = FIELDS.map(f => rec[f]);
    sheet.appendRow(row);
    return rec;
  } finally {
    lock.releaseLock();
  }
}

/** แก้ไขลิงค์ตาม id คืน object ที่แก้ หรือ throw ถ้าไม่พบ */
function updateLink_(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getDataSheet_();
    const id = clean_(payload.id);
    const rowNum = findRowById_(sheet, id);
    if (rowNum < 0) throw new Error('NOT_FOUND');

    const values = sheet.getDataRange().getValues();
    const col = buildHeaderMap_(values[0]);
    const current = rowToObject_(values[rowNum - 1], col);

    const rec = {
      id: id,
      name: clean_(payload.name),
      webAppUrl: clean_(payload.webAppUrl),
      sheetUrl: clean_(payload.sheetUrl),
      category: clean_(payload.category),
      owner: clean_(payload.owner),
      description: clean_(payload.description),
      status: clean_(payload.status) || 'active',
      createdAt: current.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const row = FIELDS.map(f => rec[f]);
    sheet.getRange(rowNum, 1, 1, row.length).setValues([row]);
    return rec;
  } finally {
    lock.releaseLock();
  }
}

/** ลบลิงค์ตาม id คืน true หรือ throw ถ้าไม่พบ */
function deleteLink_(id) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getDataSheet_();
    const rowNum = findRowById_(sheet, clean_(id));
    if (rowNum < 0) throw new Error('NOT_FOUND');
    sheet.deleteRow(rowNum);
    return true;
  } finally {
    lock.releaseLock();
  }
}

/** ตัดช่องว่างหัวท้าย แปลง null/undefined เป็น '' */
function clean_(v) {
  return (v === null || v === undefined) ? '' : String(v).trim();
}
