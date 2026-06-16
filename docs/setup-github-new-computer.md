---
name: setup-github
description: ตั้งค่า git + GitHub CLI (gh) บนเครื่องใหม่ พร้อม auth, clone repo เดิม และ push/deploy GitHub Pages ได้
---

# Setup GitHub สำหรับเครื่องใหม่

> 📌 ไฟล์นี้เป็นทั้ง **คู่มือ** และ **skill** — ถ้าย้ายเครื่องใหม่ ก็อปไฟล์นี้ไปวางที่โฟลเดอร์ skills ของ Claude
> (เช่นข้างๆ `setup-clasp`) ในชื่อ `setup-github/SKILL.md` ก็จะเรียกใช้เป็น skill ได้ทันที

ใช้เมื่อย้ายมาเครื่องใหม่ แล้วต้องการดึงโปรเจกต์เดิมจาก GitHub มาทำงานต่อ และ push ขึ้นได้

ก่อนเริ่ม ถามผู้ใช้ว่าจะเก็บโค้ดไว้โฟลเดอร์ไหน เช่น `D:\code` แล้วใช้ path นั้นตลอด guide นี้

## ข้อมูลบัญชีของผู้ใช้

| รายการ | ค่า |
|--------|-----|
| GitHub username | `sagi2536` |
| Email (สำหรับ git) | `sukitsu@g.swu.ac.th` |

### Repo ที่มีอยู่

| โปรเจกต์ | URL |
|---------|-----|
| ระบบเก็บลิงค์เว็บแอป (GitHub Pages + Apps Script) | https://github.com/sagi2536/weblink-directory |

> เว็บที่ deploy แล้ว: https://sagi2536.github.io/weblink-directory/

---

## ขั้นที่ 1 — ติดตั้ง git

```powershell
git --version
```

- ถ้าเห็นเวอร์ชัน → ข้ามไปขั้นต่อไป
- ถ้า error → ติดตั้ง:

```powershell
winget install Git.Git --accept-source-agreements --accept-package-agreements
```

แล้วปิด/เปิด PowerShell ใหม่

## ขั้นที่ 2 — ติดตั้ง GitHub CLI (gh)

```powershell
winget install GitHub.cli --accept-source-agreements --accept-package-agreements
```

> หลังติดตั้ง PATH ของหน้าต่างเดิมจะยังไม่เห็น `gh` ให้ปิด/เปิด PowerShell ใหม่
> หรือเรียกผ่าน full path ชั่วคราว: `& "C:\Program Files\GitHub CLI\gh.exe" --version`

## ขั้นที่ 3 — ตั้งชื่อผู้ใช้ git (ครั้งเดียวต่อเครื่อง)

```powershell
git config --global user.name "sagi2536"
git config --global user.email "sukitsu@g.swu.ac.th"
git config --global init.defaultBranch main
```

## ขั้นที่ 4 — ยืนยันตัวตนกับ GitHub

### วิธี A (สำหรับคนพิมพ์เอง ในเทอร์มินัลจริง) — ง่ายสุด

```powershell
gh auth login
```

ตอบ: `GitHub.com` → `HTTPS` → `Yes` (authenticate Git) → `Login with a web browser`
แล้วคัดลอกโค้ดไปวางในเบราว์เซอร์ที่เด้งขึ้น → Authorize

### วิธี B (เมื่อให้ Claude ทำผ่านคำสั่ง / เทอร์มินัลไม่โต้ตอบ) — ใช้ Personal Access Token

1. สร้าง token: https://github.com/settings/tokens/new
   - Scopes: ติ๊ก **`repo`** + **`workflow`** (ถ้าจะใช้ `gh auth login` ด้วยต้องเพิ่ม **`read:org`**)
   - กด Generate → คัดลอกรหัส `ghp_...` (ยาว ~40 ตัว)
2. เก็บ token ลง Windows Credential Manager ให้ git ใช้ push ได้ (วิธีนี้ทนทาน ไม่ต้องล็อกอิน gh):

```powershell
git config --global credential.helper manager
$body = "protocol=https`nhost=github.com`nusername=sagi2536`npassword=ghp_วางรหัสที่นี่`n`n"
$tmp = Join-Path $env:TEMP "gitcred.txt"
[IO.File]::WriteAllText($tmp, $body, (New-Object System.Text.UTF8Encoding($false)))
cmd /c "git credential approve < `"$tmp`""
Remove-Item $tmp -Force
git ls-remote https://github.com/sagi2536/weblink-directory HEAD   # ทดสอบ: ได้ hash = สำเร็จ
```

> ⚠️ **กับดักสำคัญ (เคยเจอมาแล้ว):** อย่าใช้ `"ghp_..." | gh auth login --with-token` ตรงๆ ใน PowerShell
> เพราะ pipe จะทำให้ token **เพี้ยน** → ขึ้น `401 Bad credentials` ทั้งที่ token ถูกต้อง
> ให้เขียน token ลงไฟล์ด้วย `[IO.File]::WriteAllText` (UTF8 ไม่มี BOM) แล้ว redirect ผ่าน `cmd /c "... < file"`
> หรือถ้าจะเรียก `gh` ให้ตั้ง `$env:GH_TOKEN = "ghp_..."` แทนการ pipe

## ขั้นที่ 5 — Clone โปรเจกต์เดิม

```powershell
cd "D:\code"
gh repo clone sagi2536/weblink-directory
# หรือ: git clone https://github.com/sagi2536/weblink-directory
```

## ขั้นที่ 6 — เปิด Claude Code ในโฟลเดอร์โปรเจกต์

```powershell
cd "D:\code\weblink-directory"
claude
```

---

## คำสั่งที่ใช้บ่อย

| คำสั่ง | หน้าที่ |
|--------|---------|
| `git status` | ดูว่ามีไฟล์ไหนเปลี่ยน |
| `git add -A` | เตรียมไฟล์ที่เปลี่ยนทั้งหมดเข้า commit |
| `git commit -m "ข้อความ"` | บันทึก commit |
| `git push` | อัปขึ้น GitHub (Pages อัปเดตเองใน 1-2 นาที) |
| `git pull` | ดึงงานล่าสุดจาก GitHub ลงเครื่อง (สำคัญถ้าใช้หลายเครื่อง) |
| `gh repo view --web` | เปิดหน้า repo ในเบราว์เซอร์ |

### workflow ปกติเวลาแก้เว็บ

```powershell
git pull            # ดึงล่าสุดก่อน (ถ้าใช้หลายเครื่อง)
# ...แก้ไฟล์...
git add -A
git commit -m "อธิบายว่าแก้อะไร"
git push
```

## หมายเหตุ

- ทำขั้นที่ 1–4 **ครั้งเดียวต่อเครื่อง** จากนั้นแค่ clone repo ใหม่ๆ ได้เลย
- ใช้หลายเครื่อง: ก่อนเริ่มทำงานทุกครั้งให้ `git pull` ก่อน แล้วค่อยแก้ เพื่อกัน conflict
- เว็บนี้ใช้ Google Apps Script เป็น backend ด้วย — การจัดการฝั่งนั้นดู skill `setup-clasp`
- ถ้า token หมดอายุ/ถูกลบ: สร้างใหม่แล้วทำขั้นที่ 4 วิธี B ซ้ำ
