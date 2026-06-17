# ระบบเก็บลิงค์เว็บแอปที่พัฒนา (Web App Link Directory)

ระบบเก็บรวบรวมลิงค์เว็บแอปที่พัฒนาขึ้น โดยใช้ **Google Sheet เป็นฐานข้อมูล**,
**Google Apps Script เป็น API**, และ **GitHub Pages เป็นหน้าเว็บ (frontend)**

## 🔗 ลิงก์ใช้งานจริง

| | URL |
|---|---|
| 🌐 หน้าหลัก (public) | https://sagi2536.github.io/weblink-directory/ |
| 🔐 หน้าแอดมิน | https://sagi2536.github.io/weblink-directory/admin.html |
| 📦 Repository | https://github.com/sagi2536/weblink-directory |

## ความสามารถ

- 📋 เก็บข้อมูล: ชื่อระบบ, ลิงค์ Web App, ลิงค์ Google Sheet, หมวดหมู่, ผู้พัฒนา, คำอธิบาย, สถานะ
- 🔍 หน้า public: ดู / ค้นหา / กรองตามหมวดหมู่
- 🔐 หน้าแอดมิน: เพิ่ม / แก้ไข / ลบ (ตรวจรหัสผ่านฝั่ง Apps Script)
- ▦ สร้าง **QR Code อัตโนมัติ** จากลิงค์ + ดาวน์โหลดเป็น PNG
- ⧉ คัดลอกลิงค์, 📤 ส่งออก CSV
- 🌐 สองภาษา **ไทย / อังกฤษ** สลับได้ (จำค่าไว้)
- 🎨 ธีม **Dark / Light** สไตล์ Glassmorphism สลับได้ด้วยปุ่ม ☀️/🌙 (จำค่าไว้, ค่าเริ่มต้น = Dark)
- 📱 Responsive รองรับมือถือ

## โครงสร้างไฟล์

```
index.html              หน้า public (ดู/ค้นหา/QR)
admin.html              หน้าแอดมิน (ล็อกอิน + เพิ่ม/แก้ไข/ลบ)
assets/
  css/style.css         สไตล์รวม (ธีม Dark เป็นค่าเริ่มต้น + ชุดสี Light แบบ override)
  js/config.js          ⚙️ ตั้งค่า API_URL ที่นี่
  js/theme.js           สลับธีม Dark/Light + จำค่า (โหลดใน <head> กัน flash)
  js/i18n.js            คำแปล ไทย/อังกฤษ
  js/api.js             ตัวเรียก API
  js/qr.js              สร้าง/ดาวน์โหลด QR
  js/public.js          ตรรกะหน้า public
  js/admin.js           ตรรกะหน้าแอดมิน
apps-script/            โค้ดฝั่ง Google Apps Script (backend) — push ด้วย clasp
  Code.gs               doGet/doPost (API)
  Data.gs               อ่าน/เขียน Sheet
  Config.gs             ค่าคงที่ (ชื่อชีต/คอลัมน์)
  appsscript.json       manifest (timeZone, scope, webapp access)
docs/                   คู่มือสำหรับย้ายเครื่องใหม่ (git/GitHub + clasp)
```

> 💡 ลิงก์ CSS/JS ใน HTML มี `?v=N` ต่อท้าย (cache-busting) — **เมื่อแก้ไฟล์ CSS/JS ให้บวกเลข `v` ขึ้น**
> เพื่อบังคับให้เบราว์เซอร์ดึงไฟล์ใหม่ (กันปัญหาแคชไฟล์เก่า)

> หมายเหตุ: `.clasp.json` และ `.clasprc.json` ถูก gitignore ไว้ — ถ้า clone มาเครื่องใหม่ต้องสร้าง `.clasp.json` เอง (ดู `docs/`)

---

## ขั้นตอนติดตั้ง (สร้างใหม่จากศูนย์)

### ส่วนที่ 1 — ฐานข้อมูล + API (Google Apps Script)

1. **สร้าง Google Sheet ใหม่** (จะเป็นฐานข้อมูล) — ไม่ต้องสร้างหัวคอลัมน์เอง ระบบสร้างให้
2. ในชีตนั้นเปิด **Extensions → Apps Script** (สำคัญ: ต้องเป็นสคริปต์ที่ **ผูกกับชีต** เพราะโค้ดใช้ `getActiveSpreadsheet()`)
3. คัดลอกเนื้อหาไฟล์ใน `apps-script/` ไปวางในโปรเจกต์ Apps Script ให้ครบ:
   - สร้างไฟล์ `Code.gs`, `Data.gs`, `Config.gs` (เนื้อหาตามไฟล์ในโฟลเดอร์นี้)
   - Project Settings → ติ๊ก "Show appsscript.json" แล้ววางเนื้อหา `appsscript.json`
   - *(หรือใช้ `clasp` push ทั้งโฟลเดอร์ — ดู docs/setup-clasp-new-computer.md)*
4. **ตั้งรหัสผ่านแอดมิน** — Project Settings → Script Properties → Add property
   - Property = `ADMIN_PASSWORD`, Value = รหัสที่ต้องการ (ควรเดายาก)
5. **Deploy:** กด **Deploy → New deployment → type "Web app"**
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
   - กด Deploy แล้ว **คัดลอก URL ที่ลงท้ายด้วย `/exec`**
6. ⚠️ **กด Authorize ครั้งแรก** (สำคัญมาก): ในตัวแก้ไข เลือกฟังก์ชัน `setupSheet` → **Run** →
   Review permissions → Advanced → Allow
   *(ถ้าไม่ทำขั้นนี้ ทุก request จะขึ้น "การเข้าถึงถูกปฏิเสธ" แม้ตั้ง access เป็น Anyone แล้ว)*

> ⚠️ ทุกครั้งที่แก้โค้ดฝั่ง Apps Script ต้อง **Deploy เวอร์ชันใหม่** (Manage deployments → Edit → New version)
> ลิงค์ `/exec` เดิมถึงจะอัปเดต

### ส่วนที่ 2 — หน้าเว็บ (GitHub Pages)

1. เปิดไฟล์ `assets/js/config.js` วาง URL `/exec` ลงใน `API_URL`
   ```js
   API_URL: 'https://script.google.com/macros/s/AKfyc.../exec',
   ```
   (ปรับชื่อแอป `APP_NAME_TH` / `APP_NAME_EN` ได้ตามต้องการ)
2. สร้าง repository บน GitHub แล้วอัปโหลดไฟล์ทั้งหมด
3. ไปที่ **Settings → Pages → Source: Deploy from a branch → branch `main` / root** → Save
4. รอสักครู่ เว็บจะใช้งานได้ที่ `https://<username>.github.io/<repo>/`

---

## การใช้งาน

- **หน้าหลัก (`index.html`)** — ทุกคนเข้าดู ค้นหา สลับธีม/ภาษา และสแกน/ดาวน์โหลด QR ได้
- **หน้าแอดมิน (`admin.html`)** — กรอกรหัสผ่านเพื่อเพิ่ม/แก้ไข/ลบรายการ
  (รหัสผ่านถูกตรวจที่ฝั่ง Apps Script เสมอ ไม่ได้ฝังไว้ในหน้าเว็บ)

## วิธีอัปเดตเว็บ (เครื่องที่ตั้งค่าไว้แล้ว)

```bash
# แก้ไฟล์ frontend... ถ้าแก้ CSS/JS อย่าลืมบวกเลข ?v= ใน index.html / admin.html
git add -A
git commit -m "อธิบายว่าแก้อะไร"
git push                     # GitHub Pages อัปเดตเองใน 1-2 นาที

# ถ้าแก้ฝั่ง apps-script/ ให้ push + redeploy ด้วย clasp
clasp push
clasp deploy --deploymentId <DEPLOYMENT_ID> --description "..."
```

---

## หมายเหตุด้านความปลอดภัย

- รหัสผ่านเก็บใน Script Properties ฝั่ง Google และตรวจสอบฝั่ง server — โค้ดหน้าเว็บไม่มีรหัสผ่าน
- Web App ตั้ง access เป็น `Anyone` ใครมี URL `/exec` ก็เรียก `list` (อ่าน) ได้
  แต่การ **เพิ่ม/แก้ไข/ลบ ต้องมีรหัสผ่าน** เสมอ
- ควรตั้งรหัสผ่านเป็นค่าที่เดายาก และอย่า commit รหัสผ่านลงใน Git

## ปัญหาที่พบบ่อย

| อาการ | วิธีแก้ |
|---|---|
| หน้าเว็บขึ้น "ยังไม่ได้ตั้งค่า API_URL" | ยังไม่ได้วาง URL `/exec` ใน `config.js` |
| ทุก request ขึ้น "การเข้าถึงถูกปฏิเสธ" | ยังไม่ได้ **Authorize** — เปิดตัวแก้ไข → Run `setupSheet` → Allow (ดูขั้นตอนที่ 1 ข้อ 6) |
| โหลดข้อมูลไม่สำเร็จ / CORS error | ตรวจว่า Deploy เป็น Web app, access = `Anyone` และใช้ URL `/exec` (ไม่ใช่ `/dev`) |
| แก้โค้ด Apps Script แล้วไม่อัปเดต | ต้อง Deploy เวอร์ชันใหม่ (New version) |
| รหัสผ่านไม่ถูกต้องทั้งที่ใส่ถูก | ยังไม่ได้ตั้ง `ADMIN_PASSWORD` ใน Script Properties |
| แก้ธีม/CSS/JS แล้วหน้าเว็บไม่เปลี่ยน | เบราว์เซอร์แคชไฟล์เก่า — กด `Ctrl`+`Shift`+`R` (และเวลาแก้ ให้บวกเลข `?v=` ในลิงก์ไฟล์) |
