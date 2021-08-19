# STEP 1 สร้าง Table ของ HOSxP สำหรับ api

- สร้าง Table ใช้โครงสร้างจาก db/moph_vaccine_history_api.sql

# STEP2 Download

```
git clone https://github.com/nirawit-git/autocheck_cid_moph_cvp
```

# STEP3 Installation

```
npm i
```

# STEP4 Config

แก้ไขไฟล์ `.env.txt` ให้เป็น `.env` เพื่อกำหนดค่าการเชื่อมต่อฐานข้อมูล

# STEP5

## Run แบบที่ 1

```
npm start
```

## Run แบบที่ 2 \*แนะนำ

```
pm2 start ecosystem.config.js
```

# HTTP STATUS NOTE

- Request failed with status code 501 คือ Invalid CID ไม่พบ CID ใน MOPH IC
- Request failed with status code 401 คือ Too Many Request per minute เรียกใช้งานจำนวนมากเกินไป โดยแก้ไขไฟล์.env <code>URL_API_CALL_DELAY_MS</code> เพิ่มให้มากขึ้น แนะนำ 1000 (1000 = 1 วิ)

#เอกสารเกี่ยวกับ MOPH Immunization Center API

- https://docs.google.com/document/d/1Inyhfrte0pECsD8YoForTL2W8B2hOxezf0GpTGEjJr8/edit#

#เทคนิค password_hash โดยใช้ HMACSHA256 online

- เข้า website => https://www.conversion-tool.com/sha256/
- Hash algorithm: SHA-256
- Text to apply hash algorithm to (optional): รหัส cvp1.moph.go.th
- HMAC hash key (optional): \$jwt@moph#
- Output format: เลือก Hexadecimal uppercase(e.g. "AABBCCDDEEFF0011")
