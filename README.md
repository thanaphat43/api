# STEP 1 สร้าง Table ของ HOSxP สำหรับ api
- สร้าง Table ใช้โครงสร้างจาก db/moph_vaccine_history_api.sql

# STEP2 Download
```
git clone 
```
# STEP3 Installation
```
npm i
```
# STEP4 Config
แก้ไขไฟล์ `.env ` เพื่อกำหนดค่าการเชื่อมต่อฐานข้อมูล

# STEP5

## Run แบบที่ 1 
```
npm start
```
## Run แบบที่ 2 *แนะนำ 
```
pm2 start ecosystem.config.js
```
# HTTP STATUS NOTE
- Request failed with status code 501 คือ Invalid CID ไม่พบ CID ใน MOPH IC
- Request failed with status code 401 คือ Too Many Request per minute เรียกใช้งานจำนวนมากเกินไป โดยแก้ไขไฟล์.env <code>URL_API_CALL_DELAY_MS</code> เพิ่มให้มากขึ้น แนะนำ 1000 (1000 = 1 วิ)