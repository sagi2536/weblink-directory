---
name: setup-clasp
description: ตั้งค่า Node.js + clasp + Google Apps Script บนเครื่องใหม่ พร้อม clone โปรเจกต์และใช้ Claude Code CLI ได้
---

# Setup Clasp สำหรับเครื่องใหม่

> 📌 ไฟล์นี้เป็นทั้ง **คู่มือ** และ **skill** — ถ้าย้ายเครื่องใหม่ ก็อปไฟล์นี้ไปวางที่โฟลเดอร์ skills ของ Claude
> ในชื่อ `setup-clasp/SKILL.md` ก็จะเรียกใช้เป็น skill ได้ทันที

ก่อนเริ่ม ถามผู้ใช้ว่าต้องการเก็บโค้ดไว้ที่โฟลเดอร์ไหนบนเครื่องนี้ เช่น `D:\code\code` หรือ `C:\Projects` แล้วใช้ path นั้นแทนตลอดทั้ง guide นี้

## ขั้นที่ 1 — ตรวจสอบ Node.js

รันคำสั่งต่อไปนี้ใน PowerShell แล้วรายงานผล:

```powershell
node --version
```

- ถ้าเห็น `v22.x.x` หรือสูงกว่า → ข้ามไปขั้นที่ 2
- ถ้าเห็น error → ติดตั้งด้วย:

```powershell
winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
```

แล้วปิด/เปิด PowerShell ใหม่

## ขั้นที่ 2 — เปิด Execution Policy

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

กด `Y` เพื่อยืนยัน (ถ้าเคยทำแล้วจะไม่มี prompt ขึ้น ถือว่าผ่าน)

## ขั้นที่ 3 — ติดตั้ง clasp

```powershell
npm install -g @google/clasp
clasp --version
```

ควรเห็น `3.x.x`

## ขั้นที่ 4 — เปิด Apps Script API (ทำในเบราว์เซอร์)

เปิดลิงก์ต่อไปนี้แล้วสลับสวิตช์เป็น ON:
https://script.google.com/home/usersettings

## ขั้นที่ 5 — Login

```powershell
clasp login
```

เบราว์เซอร์จะเด้งขึ้นมา → เลือกบัญชี Google → Allow → เห็น "Logged in!"

## ขั้นที่ 6 — Clone โปรเจกต์

ใช้โฟลเดอร์ที่ผู้ใช้กำหนดในขั้นแรก แทน `<BASE_FOLDER>` ด้วย path จริง:

```powershell
mkdir "<BASE_FOLDER>\ชื่อโปรเจกต์"
cd "<BASE_FOLDER>\ชื่อโปรเจกต์"
clasp clone "SCRIPT_ID"
```

> หา Script ID จาก URL ของโปรเจกต์ GAS:
> `script.google.com/u/0/home/projects/`**`SCRIPT_ID_อยู่ตรงนี้`**`/edit`

### Script IDs ของโปรเจกต์ที่มีอยู่

| โปรเจกต์ | Script ID |
|---------|-----------|
| ระบบ CME คณบดี | `1K5lgbOc-U6TGPUUcVOocCFk1t_qAaGZAEN37L9YcvNEqDrC2LHrsAm90` |
| ระบบเก็บลิงค์เว็บแอป | `1eSXAq5Sl6adjm4ZFw5jZqqTdn9scj-r6khiexxlFLptO2eMxGtqHRR_K` |

> **โน้ตเฉพาะ "ระบบเก็บลิงค์เว็บแอป":** เป็น web app ที่ frontend อยู่บน GitHub Pages และ backend (ไฟล์ `.gs`)
> อยู่ในโฟลเดอร์ย่อย `apps-script/` — ไฟล์ `.clasp.json` ตั้ง `"rootDir": "apps-script"` และ **ไม่ได้อยู่ใน git**
> (gitignore ไว้) ดังนั้นถ้า clone repo จาก GitHub มาเครื่องใหม่ ต้องสร้าง `.clasp.json` เองที่ราก repo:
>
> ```json
> { "scriptId": "1eSXAq5Sl6adjm4ZFw5jZqqTdn9scj-r6khiexxlFLptO2eMxGtqHRR_K", "rootDir": "apps-script" }
> ```
>
> แล้วใช้ `clasp push` ได้ตามปกติ — แก้ `.gs` แล้วต้อง **redeploy เวอร์ชันใหม่** ลิงก์ `/exec` ถึงจะอัปเดต
> (repo: https://github.com/sagi2536/weblink-directory)

## ขั้นที่ 7 — เปิด Claude Code CLI ในโฟลเดอร์โปรเจกต์

```powershell
cd "<BASE_FOLDER>\ชื่อโปรเจกต์"
claude
```

Claude Code จะเห็นไฟล์โปรเจกต์และสั่ง `clasp push` ให้อัตโนมัติได้

## คำสั่งที่ใช้บ่อย

| คำสั่ง | หน้าที่ |
|--------|---------|
| `clasp push` | อัปโค้ดในเครื่อง → ขึ้น GAS |
| `clasp pull` | ดึงโค้ดจาก GAS → ลงเครื่อง |
| `clasp status` | ดูไฟล์ที่จะถูก push |
| `clasp open-script` | เปิดโปรเจกต์ในเบราว์เซอร์ |

## หมายเหตุ

- `clasp login` ทำครั้งเดียวต่อเครื่อง ข้ามโปรเจกต์ได้เลย
- โปรเจกต์ใหม่ทำแค่ `mkdir` → `cd` → `clasp clone` → `clasp push`
- แต่ละเครื่องกำหนด BASE_FOLDER ต่างกันได้อิสระ
