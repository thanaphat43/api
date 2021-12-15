"use strict";

require("dotenv").config();
// const Knex = require('knex');
// const crypto = require('crypto');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const HttpStatus = require("http-status-codes");
const axios = require("axios");
const https = require("https");
// const CronJob = require("cron").CronJob;
const moment = require("moment");
const fs = require("fs");
const jwt_decode = require('jwt-decode');
var _token = "";

// @ts-ignore
axios.defaults.baseURL = process.env.URL_API;
const model = require("./model");
const app = express();

var dbHIS = require("knex")({
    client: "mysql",
    connection: {
        host: process.env.DB_HIS_HOST,
        user: process.env.DB_HIS_USER,
        port: +process.env.DB_HIS_PORT,
        password: process.env.DB_HIS_PASSWORD,
        database: process.env.DB_HIS_NAME,
        insecureAuth: true
    },
    pool: {
        min: 0,
        max: 100,
        afterCreate: (conn, done) => {
            conn.query("SET NAMES utf8", err => {
                done(err, conn);
            });
        }
    }
});

var db = require("knex")({
    client: "mysql",
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: +process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        insecureAuth: true
    },
    pool: {
        min: 0,
        max: 100,
        afterCreate: (conn, done) => {
            conn.query("SET NAMES utf8", err => {
                done(err, conn);
            });
        }
    }
});

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// @ts-ignore
app.get("/", (req, res) =>
    res.send({
        ok: true,
        message: "Welcome to my api server!",
        code: HttpStatus.OK
    })
);

app.get("/check/:cid", async(req, res) => {
    var cid = req.params.cid;
    try {
        // await getToken();
        await checkToken();
        // const rs = await checkImmunizationHistoryCID(cid)
        // @ts-ignore
        axios.get(`/api/ImmunizationHistory?cid=${cid}`, {
                headers: {
                    Authorization: `Bearer ${_token}`
                },
                httpsAgent: new https.Agent({
                    rejectUnauthorized: false
                })
            }).then(function(response) {
                // console.log(response)
                res.send(response.data);
            })
            .catch(function(error) {
                res.send({});
                // console.log(error)
                // res.send({ ok: false, rows: error });
            })

        // res.send(response);
    } catch (error) {
        // Handle Error Here
        res.send({ ok: false, rows: error });
    }
});

app.post("/send-message-to-user", async(req, res) => {
    var data = req.body
    try {
        var data_rs = [];
        await checkToken();
        const response = await axios.post(`/api/SendMessageTarget`, data, {
            headers: {
                Authorization: `Bearer ${_token}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        console.log(response);
        if (response.data) {
            await data_rs.push({
                ok: true,
                status: true,
                status_color: "success",
                text: `ส่งการแจ้งเตือน สำเร็จ`
            });
        } else {
            await data_rs.push({
                ok: true,
                status: false,
                status_color: "error",
                text: `ส่งการแจ้งเตือน ไม่สำเร็จ`
            });
        }
        res.send(data_rs);

    } catch (error) {
        res.send({ ok: false, rows: error });
    }
})

app.get("/check-cvp-moph-todb/:cid", async(req, res) => {
    var cid = req.params.cid;
    try {
        var data_rs = [];
        // await getToken();
        await checkToken();
        console.log("cid:" + cid);
        // @ts-ignore
        const response = await axios.get(`/api/ImmunizationHistory?cid=${cid}`, {
            headers: {
                Authorization: `Bearer ${_token}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        // console.log(response.data.result.vaccine_certificate);

        if (response.data.result.vaccine_certificate) {
            var i = 0;
            for await (const v of response.data.result.patient.visit) {
                const a = v.visit_immunization[0].vaccine_ref_name.indexOf("[");
                const b = v.visit_immunization[0].vaccine_ref_name.indexOf("]");
                const strVaccine_ref_name = v.visit_immunization[0].vaccine_ref_name.substring(
                    a + 1,
                    b
                );
                // console.log(`moph_vaccine_ref_name: ${v.visit_immunization[0].vaccine_ref_name} | Vaccine_ref_name: ${strVaccine_ref_name}`);
                let dose_no = ++i;
                const manufacturer_id =
                    (await getVaccineManufacturerID(strVaccine_ref_name)) || null;
                const data = await {
                    cid: cid,
                    vaccine_dose_no: dose_no,
                    visit_datetime: v.visit_datetime,
                    vaccine_name: v.visit_immunization[0].vaccine_ref_name,
                    vaccine_manufacturer_id: manufacturer_id,
                    vaccine_lot_number: v.visit_immunization[0].lot_number,
                    hospital_code: v.hospital_code,
                    hospital_name: v.hospital_name,
                    visit_guid: v.visit_guid,
                    immunization_datetime: v.visit_immunization[0].immunization_datetime
                };
                const ck = await checkInsertDataHistory(cid, dose_no);
                // console.log(ck.length);
                if (ck.length == 0) {
                    await data_rs.push({
                        ok: true,
                        status: true,
                        status_color: "success",
                        text: `Update แล้ว DOSE[${dose_no}] {${strVaccine_ref_name} - ${moment(v.visit_datetime).format("DD/MM/YYYY HH:mm:ss")}(${v.hospital_name})}`
                    });
                    log("[UPDATE] CID: " + cid);
                    await model.insertDataHistory(dbHIS, data);
                } else {
                    await data_rs.push({
                        ok: true,
                        status: false,
                        status_color: "warning",
                        text: `ข้อมูลนี้ Update ไปแล้ว DOSE[${dose_no}] {${strVaccine_ref_name} - ${moment(v.visit_datetime).format("DD/MM/YYYY HH:mm:ss")}(${v.hospital_name})}`
                    });
                    // data_rs.push({a:1})
                    // console.log(data_rs)
                    log(`[NO UPDATE] CID & DOSE Duplicate ${cid}[${dose_no}] {${strVaccine_ref_name} - ${moment(v.visit_datetime).format("DD/MM/YYYY HH:mm:ss")}(${v.hospital_name})}`);
                }
            }
        } else if (response.data.result.vaccine_certificate && response.data.result.patient !== null) {
            await data_rs.push({
                ok: true,
                status: false,
                status_color: "warning",
                text: `ไม่พบข้อมูลการได้รับวัคซีน CID นี้`
            });
            log("ไม่พบข้อมูลการได้รับวัคซีน CID :" + cid, false);
        } else {
            await data_rs.push({
                ok: true,
                status: false,
                status_color: "error",
                text: `ไม่พบ CID นี้`
            });
            log("ไม่พบ CID:" + cid, false);
        }
        // const data = await checkImmunizationHistoryCID(cid);
        console.log(data_rs);
        // res.send({ ok: true, rows: data })
        res.send(data_rs);
    } catch (error) {
        // Handle Error Here
        console.log("error", error);
        res.send({ ok: false, rows: error });
    }
});

function log(text, log = true) {
    var _text = `${moment().format("DD-MM-YYYY HH:mm:ss")} - ${text}`;
    // fs.appendFileSync('./log.log', `${_text}\n`);
    if (!log && (process.env.NODE_ENV !== "development")) {
        fs.appendFileSync("./log.log", `${_text}\n`);
    }
    console.log(_text);
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getToken() {
    // @ts-ignore
    console.log("current token:" + _token);
    // @ts-ignore
    const rs = await axios.get(
        `/token?Action=get_moph_access_token&${process.env.CVP_MOPH_ACCESS_TOKEN}`, {
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        }
    );
    _token = rs.data;
    log(`[GET Token]` + _token);
}

async function checkToken() {
    // console.log('_token:' + _token);
    if (_token) {
        // @ts-ignore
        const decodeJWT = jwt_decode(_token);
        var currentTimestamp = new Date().getTime() / 1000;
        var tokenIsNotExpired = decodeJWT.exp > currentTimestamp;
        if (!tokenIsNotExpired) {
            console.log('JWT Expired')
            await getToken();
        }
    } else {
        console.log('NO JWT');
        await getToken();
    }
}

async function checkImmunizationHistoryCID(cid) {
    try {
        // @ts-ignore
        await delay(process.env.URL_API_CALL_DELAY_MS);
        // @ts-ignore
        const response = await axios.get(`/api/ImmunizationHistory?cid=${cid}`, {
            headers: {
                Authorization: `Bearer ${_token}`
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        if (response.data.result.vaccine_certificate.length > 0) {
            // await model.updateStatus(db, cid)
            // console.log('result', response.data.result.patient.visit);
            response.data.result.patient.visit.forEach(async(v, i) => {
                const a = v.visit_immunization[0].vaccine_ref_name.indexOf("[");
                const b = v.visit_immunization[0].vaccine_ref_name.indexOf("]");
                const strVaccine_ref_name = v.visit_immunization[0].vaccine_ref_name.substring(
                    a + 1,
                    b
                );
                // console.log(`moph_vaccine_ref_name: ${v.visit_immunization[0].vaccine_ref_name} | Vaccine_ref_name: ${strVaccine_ref_name}`);
                let dose_no = ++i;
                const manufacturer_id =
                    (await getVaccineManufacturerID(strVaccine_ref_name)) || null;
                const data = await {
                    cid: cid,
                    vaccine_dose_no: dose_no,
                    visit_datetime: v.visit_datetime,
                    vaccine_name: v.visit_immunization[0].vaccine_ref_name,
                    vaccine_manufacturer_id: manufacturer_id,
                    vaccine_lot_number: v.visit_immunization[0].lot_number,
                    hospital_code: v.hospital_code,
                    hospital_name: v.hospital_name,
                    visit_guid: v.visit_guid,
                    immunization_datetime: v.visit_immunization[0].immunization_datetime
                };
                // console.log(`v.visit_immunization[0].vaccine_ref_name : ${v.visit_immunization[0].vaccine_ref_name.substring(a+1,b)}`);
                // console.log(data);
                const ck = await checkInsertDataHistory(cid, dose_no);
                // console.log(ck.length);
                if (ck.length == 0) {
                    log("[UPDATE] CID: " + cid);
                    await model.insertDataHistory(dbHIS, data);
                } else {
                    log(`[NO UPDATE] CID & DOSE Duplicate ${cid}[${dose_no}]`);
                }
            });
        } else {
            log("[NO UPDATE] CID:" + cid, false);
        }
        return response.data.result;
    } catch (error) {
        await checkToken();
        log("[ERROR]" + error);
    }
}

async function getList() {
    log("[START] getList...", false);
    const rs = await model.getList(dbHIS);
    log("[getList] Patient COUNT: " + rs.length);
    var i = 0;
    for await (const v of rs) {
        i = i + 1;
        log(`index loop : ${i}  [CID] : ${v.cid}`, false);
        await checkImmunizationHistoryCID(v.cid);
    }
    log("[END] getList...", false);
    await getVaccineBooking(process.env.TABLE_MULTIPLE);
}

// async function getVaccineBookingTravel() {
//     log('[START] getVaccineBookingTravel...', false);
//     const rs = await model.getVaccineBookingTravel(db)
//     log('[getVaccineBookingTravel] Patient COUNT: ' + rs.length);
//     var i = 0;
//     for await (const v of rs) {
//         i = i + 1;
//         log(`index loop : ${i}  [CID] : ${v.cid}`, false);
//         await checkImmunizationHistoryCID(v.cid);
//     }
//     log('[END] getVaccineBookingTravel...', false);
//     await getList();
// }

async function getVaccineBooking(table) {
    const listTable = table.split(",");
    try {
        // console.log(listTable);
        for await (const v of listTable) {
            log(`[START] TABLE[${v}]...`);
            const rs = await model.getDataFormTable(db, v);
            log("[COUNT] Patient: " + rs.length);
            var i = 0;
            for await (const d of rs) {
                i = i + 1;
                log(`index loop : ${i}  [CID] : ${v.cid} | Table[${v}]`);
                await checkImmunizationHistoryCID(d.cid);
            }
            log(`[END] TABLE[${v}]...`);
        }
        await getList();
    } catch (error) {
        console.log("error: " + error);
    }
}

async function getFixBug() {
    const rs = await model.getFixBug(db);
    log("[getFixBug] Patient COUNT: " + rs[0].length);
    var i = 0;
    for await (const v of rs[0]) {
        i = i + 1;
        log(`index loop : ${i}  [CID] : ${v.cid}`, false);
        await checkImmunizationHistoryCID(v.cid);
    }
    await getList();
}

async function checkInsertDataHistory(cid, dose) {
    return await model.checkInsertDataHistory(dbHIS, cid, dose);
}

async function getVaccineManufacturerID(text) {
    try {
        const rs = await model.getVaccineManufacturerID(dbHIS, text);
        return rs[0].vaccine_manufacturer_id;
    } catch (error) {
        log("[WARNING]: " + error);
    }
}
async function runJob() {
    // await checkToken();
    log("[runJob]", false);
    await getToken();
    setTimeout(() => {
        // getFixBug();
        //getVaccineBooking(process.env.TABLE_MULTIPLE);
        // getList()
        // getVaccineBookingTravel()
        // checkImmunizationHistoryCID('1200900099000') //TEST DEBUG
    }, 100);
}
runJob();

//error handlers
if (process.env.NODE_ENV === "development") {
    // @ts-ignore
    app.use((err, req, res, next) => {
        console.log(err.stack);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: {
                ok: false,
                code: HttpStatus.INTERNAL_SERVER_ERROR,
                error: HttpStatus.getStatusText(HttpStatus.INTERNAL_SERVER_ERROR)
            }
        });
    });
}

// @ts-ignore
app.use((req, res, next) => {
    res.status(HttpStatus.NOT_FOUND).json({
        error: {
            ok: false,
            code: HttpStatus.NOT_FOUND,
            error: HttpStatus.getStatusText(HttpStatus.NOT_FOUND)
        }
    });
});

var port = +process.env.WWW_PORT || 3000;

app.listen(port, () => console.log(`Api listening on port ${port}!`));