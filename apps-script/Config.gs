/**
 * Config.gs — ค่าคงที่ทั้งหมดของระบบเก็บลิงค์เว็บแอป
 * แก้ค่าที่นี่ที่เดียว ไม่ต้องไปแก้กระจายในโค้ด
 */

// ชื่อชีตที่ใช้เก็บข้อมูล (ถ้ายังไม่มีจะถูกสร้างให้อัตโนมัติพร้อมหัวคอลัมน์)
const SHEET_NAME = 'Links';

// ลำดับคอลัมน์ (logical name) — โค้ดอ้างอิงผ่าน map นี้ ไม่ฮาร์ดโค้ด index
// ถ้าต้องการเพิ่มฟิลด์ ให้เพิ่มที่นี่และที่ HEADERS ให้ตรงกัน
const FIELDS = [
  'id',          // รหัสอ้างอิงไม่ซ้ำ (ระบบสร้างให้)
  'name',        // ชื่อระบบที่พัฒนา
  'webAppUrl',   // ลิงค์ที่อยู่ของ web app
  'sheetUrl',    // ลิงค์ที่อยู่ของ Google Sheet
  'category',    // หมวดหมู่
  'owner',       // ผู้พัฒนา/ผู้ดูแล
  'description', // คำอธิบาย/หมายเหตุ
  'status',      // สถานะ: active | archived
  'createdAt',   // วันเวลาที่สร้าง (ISO string)
  'updatedAt'    // วันเวลาที่แก้ไขล่าสุด (ISO string)
];

// หัวคอลัมน์ที่จะเขียนในแถวแรกของชีต (ภาษาไทยอ่านง่าย)
// ต้องเรียงลำดับให้ตรงกับ FIELDS ด้านบน
const HEADERS = [
  'ID',
  'ชื่อระบบ',
  'ลิงค์ Web App',
  'ลิงค์ Google Sheet',
  'หมวดหมู่',
  'ผู้พัฒนา',
  'คำอธิบาย',
  'สถานะ',
  'วันที่สร้าง',
  'วันที่แก้ไข'
];

// Key ใน Script Properties ที่เก็บรหัสผ่านแอดมิน
// ตั้งค่าได้ที่ Project Settings > Script Properties (key = ADMIN_PASSWORD)
// หรือรันฟังก์ชัน setupAdminPassword() หนึ่งครั้ง
const PROP_ADMIN_PASSWORD = 'ADMIN_PASSWORD';
