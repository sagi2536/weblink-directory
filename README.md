# ระบบเก็บลิงค์เว็บแอปที่พัฒนา (Web App Link Directory)

ระบบเก็บรวบรวมลิงค์เว็บแอปที่พัฒนาขึ้น โดยใช้ **Google Sheet เป็นฐานข้อมูล**,
**Google Apps Script เป็น API**, และ **GitHub Pages เป็นหน้าเว็บ (frontend)**

## ความสามารถ

- 📋 เก็บข้อมูล: ชื่อระบบ, ลิงค์ Web App, ลิงค์ Google Sheet, หมวดหมู่, ผู้พัฒนา, คำอธิบาย, สถานะ
- 🔍 หน้า public: ดู / ค้นหา / กรองตามหมวดหมู่
- 🔐 หน้าแอดมิน: เพิ่ม / แก้ไข / ลบ (ตรวจรหัสผ่านฝั่ง Apps Script)
- ▦ สร้าง **QR Code อัตโนมัติ** จากลิงค์ + ดาวน์โหลดเป็น PNG
- ⧉ คัดลอกลิงค์, 📤 ส่งออก CSV
- 🌐 สองภาษา **ไทย / อังกฤษ** สลับได้

## โครงสร้างไฟล์

```
index.html              หน้า public (ดู/ค้นหา/QR)
admin.html              หน้าแอดมิน (ล็อกอิน + เพิ่ม/แก้ไข/ลบ)
assets/
  css/style.css         สไตล์รวม
  js/config.js          ⚙️ ตั้งค่า API_URL ที่นี่
  js/i18n.js            คำแปล ไทย/อังกฤษ
  js/api.js             ตัวเรียก API
  js/qr.js              สร้าง/ดาวน์โหลด QR
  js/public.js          ตรรกะหน้า public
  js/admin.js           ตรรกะหน้าแอดมิน
apps-script/            โค้ดฝั่ง Google Apps Script (backend)
  Code.gs               doGet/doPost (API)
  Data.gs               อ่าน/เขียน Sheet
  Config.gs             ค่าคงที่ (ชื่อชีต/คอลัมน์)
  appsscript.json       manifest
```

---

## ขั้นตอนติดตั้ง

### ส่วนที่ 1 — ฐานข้อมูล + API (Google Apps Script)

1. **สร้าง Google Sheet ใหม่** (จะเป็นฐานข้อมูล) — ไม่ต้องสร้างหัวคอลัมน์เอง ระบบสร้างให้
2. ในชีตนั้นเปิด **Extensions → Apps Script**
3. คัดลอกเนื้อหาไฟล์ใน `apps-script/` ไปวางในโปรเจกต์ Apps Script ให้ครบ:
   - สร้างไฟล์ `Code.gs`, `Data.gs`, `Config.gs` (เนื้อหาตามไฟล์ในโฟลเดอร์นี้)
   - แท็บ Project Settings → ติ๊ก "Show appsscript.json" แล้ววางเนื้อหา `appsscript.json`
4. **ตั้งรหัสผ่านแอดมิน** — เลือก 1 วิธี:
   - **วิธี A (แนะนำ):** Project Settings → Script Properties → Add property
     - Property = `ADMIN_PASSWORD`, Value = รหัสที่ต้องการ
   - **วิธี B:** เปิด `Code.gs` แก้บรรทัด `'เปลี่ยนรหัสนี้'` ในฟังก์ชัน `setupAdminPassword`
     แล้วเลือกฟังก์ชันนั้นกด **Run** หนึ่งครั้ง (อนุญาตสิทธิ์เมื่อถูกถาม)
5. **Deploy:** กด **Deploy → New deployment → เลือก type "Web app"**
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
   - กด Deploy แล้ว **คัดลอก URL ที่ลงท้ายด้วย `/exec`**

> ⚠️ ทุกครั้งที่แก้โค้ด ต้องไป **Manage deployments → Edit → Version: New version → Deploy**
> ลิงค์เดิมถึงจะอัปเดต

### ส่วนที่ 2 — หน้าเว็บ (GitHub Pages)

1. เปิดไฟล์ `assets/js/config.js` วาง URL `/exec` ที่ได้จากขั้นตอนก่อนหน้าลงใน `API_URL`
   ```js
   API_URL: 'https://script.google.com/macros/s/AKfyc.../exec',
   ```
   (ปรับชื่อแอป `APP_NAME_TH` / `APP_NAME_EN` ได้ตามต้องการ)
2. สร้าง repository บน GitHub แล้วอัปโหลดไฟล์ทั้งหมด (ยกเว้นโฟลเดอร์ `apps-script/` จะเก็บไว้ก็ได้)
3. ไปที่ **Settings → Pages → Source: Deploy from a branch → branch `main` / root** → Save
4. รอสักครู่ เว็บจะใช้งานได้ที่ `https://<username>.github.io/<repo>/`

---

## การใช้งาน

- **หน้าหลัก (`index.html`)** — ทุกคนเข้าดู ค้นหา และสแกน/ดาวน์โหลด QR ได้
- **หน้าแอดมิน (`admin.html`)** — กรอกรหัสผ่านเพื่อเพิ่ม/แก้ไข/ลบรายการ
  (รหัสผ่านถูกตรวจที่ฝั่ง Apps Script เสมอ ไม่ได้ฝังไว้ในหน้าเว็บ)

---

## หมายเหตุด้านความปลอดภัย

- รหัสผ่านเก็บใน Script Properties ฝั่ง Google และตรวจสอบฝั่ง server — โค้ดหน้าเว็บไม่มีรหัสผ่าน
- เนื่องจาก Web App ตั้ง access เป็น `Anyone` ใครมี URL `/exec` ก็เรียก `list` (อ่าน) ได้
  แต่การ **เพิ่ม/แก้ไข/ลบ ต้องมีรหัสผ่าน** เสมอ
- ควรเปลี่ยนรหัสผ่านเป็นค่าที่เดายาก และอย่า commit รหัสผ่านลงใน Git

## ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
|---|---|
| หน้าเว็บขึ้น "ยังไม่ได้ตั้งค่า API_URL" | ยังไม่ได้วาง URL `/exec` ใน `config.js` |
| โหลดข้อมูลไม่สำเร็จ / CORS error | ตรวจว่า Deploy เป็น Web app, access = `Anyone` และใช้ URL `/exec` (ไม่ใช่ `/dev`) |
| แก้โค้ด Apps Script แล้วไม่อัปเดต | ต้อง Deploy เวอร์ชันใหม่ (New version) |
| รหัสผ่านไม่ถูกต้องทั้งที่ใส่ถูก | ยังไม่ได้ตั้ง `ADMIN_PASSWORD` ใน Script Properties |
