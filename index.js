'use strict';

require('dotenv').config();
// const Knex = require('knex');
// const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const HttpStatus = require('http-status-codes');
// const jwt_decode = require('jwt-decode');
const axios = require('axios');
const https = require('https');
const CronJob = require('cron').CronJob;
const moment = require('moment');
const fs = require('fs');

var _token = '';

// @ts-ignore
axios.defaults.baseURL = process.env.URL_API;
const model = require('./model');
const app = express();

var dbHIS = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.DB_HIS_HOST,
        user: process.env.DB_HIS_USER,
        port: +process.env.DB_HIS_PORT,
        password: process.env.DB_HIS_PASSWORD,
        database: process.env.DB_HIS_NAME,
        insecureAuth: true,
    },
    pool: {
        min: 0,
        max: 100,
        afterCreate: (conn, done) => {
            conn.query('SET NAMES utf8', (err) => {
                done(err, conn);
            });
        }
    },
});


var db = require('knex')({
    client: 'mysql',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: +process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        insecureAuth: true,
    },
    pool: {
        min: 0,
        max: 100,
        afterCreate: (conn, done) => {
            conn.query('SET NAMES utf8', (err) => {
                done(err, conn);
            });
        }
    },
});



app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// @ts-ignore
app.get('/', (req, res) => res.send({ ok: true, message: 'Welcome to my api server!', code: HttpStatus.OK }));

app.get('/check/:cid', async(req, res) => {
    var cid = req.params.cid;
    try {
        await getToken();
        // const rs = await checkImmunizationHistoryCID(cid)
        // @ts-ignore
        const response = await axios.get(`/api/ImmunizationHistory?cid=${cid}`, {
            headers: {
                'Authorization': `Bearer ${_token}`,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        res.send({ ok: true, rows: response.data.result })
    } catch (error) {
        // Handle Error Here
        res.send({ ok: false, rows: error.response.data })
    }
})

function log(text, log = true) {
    var _text = `${moment().format('DD-MM-YYYY HH:mm:ss')} - ${text}`;
    // fs.appendFileSync('./log.log', `${_text}\n`);
    if (!log) {
        fs.appendFileSync('./log.log', `${_text}\n`);
    }
    console.log(_text);
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getToken() {
    // @ts-ignore
    const rs = await axios.get(`/token?Action=get_moph_access_token&${process.env.CVP_MOPH_ACCESS_TOKEN}`, {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    });
    _token = rs.data;
    log(`[GET Token]` + _token);
}

async function checkImmunizationHistoryCID(cid) {
    try {
        // @ts-ignore
        await delay(process.env.URL_API_CALL_DELAY_MS);
        // @ts-ignore
        const response = await axios.get(`/api/ImmunizationHistory?cid=${cid}`, {
            headers: {
                'Authorization': `Bearer ${_token}`,
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
        if (response.data.result.vaccine_certificate) {
            // await model.updateStatus(db, cid)
            // console.log('result', response.data.result.patient.visit);
            response.data.result.patient.visit.forEach(async(v, i) => {
                const a = v.visit_immunization[0].vaccine_ref_name.indexOf("[");
                const b = v.visit_immunization[0].vaccine_ref_name.indexOf("]");
                const strVaccine_ref_name = v.visit_immunization[0].vaccine_ref_name.substring(a + 1, b);
                // console.log(`moph_vaccine_ref_name: ${v.visit_immunization[0].vaccine_ref_name} | Vaccine_ref_name: ${strVaccine_ref_name}`);
                let dose_no = ++i;
                const manufacturer_id = await getVaccineManufacturerID(strVaccine_ref_name) || null;
                const data = await {
                        cid: cid,
                        vaccine_dose_no: dose_no,
                        vaccine_datetime: v.visit_datetime,
                        vaccine_name: v.visit_immunization[0].vaccine_ref_name,
                        vaccine_manufacturer_id: manufacturer_id,
                        vaccine_lot_number: v.visit_immunization[0].lot_number,
                        hospital_code: v.hospital_code,
                        hospital_name: v.hospital_name,
                        visit_guid: v.visit_guid,
                        immunization_datetime: v.visit_immunization[0].immunization_datetime,
                    }
                    // console.log(`v.visit_immunization[0].vaccine_ref_name : ${v.visit_immunization[0].vaccine_ref_name.substring(a+1,b)}`);
                    // console.log(data);
                const ck = await checkInsertDataHistory(cid, dose_no)
                    // console.log(ck.length);
                if (ck.length == 0) {
                    log('[UPDATE] CID: ' + cid);
                    await model.insertDataHistory(dbHIS, data)
                } else {
                    log(`[NO UPDATE] CID & DOSE Duplicate ${cid}[${dose_no}]`);
                }
            });
        } else {
            log('[NO UPDATE] CID:' + cid, false);
        }
        return response.data.result;
    } catch (error) {
        await getToken();
        log('[ERROR]' + error);
    }
}

async function getList() {
    log('[START] getList...', false);
    const rs = await model.getList(dbHIS)
    log('[getList] Patient COUNT: ' + rs.length);
    var i = 0;
    for await (const v of rs) {
        i = i + 1;
        log(`index loop : ${i}  [CID] : ${v.cid}`, false);
        await checkImmunizationHistoryCID(v.cid);
    }
    log('[END] getList...', false);
    // await getVaccineBookingTravel();

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
    const listTable = table.split(',')
        // console.log(listTable);
    for await (const v of listTable) {
        log(`[START] TABLE[${v}]...`);
        const rs = await model.getDataFormTable(db, v)
        log('[COUNT] Patient: ' + rs.length);
        var i = 0;
        for await (const d of rs) {
            i = i + 1;
            log(`index loop : ${i}  [CID] : ${v.cid} | Table[${v}]`);
            await checkImmunizationHistoryCID(d.cid);
        }
        log(`[END] TABLE[${v}]...`);
    }
    await getList();
}

async function getFixBug() {
    const rs = await model.getFixBug(db);
    log('[getFixBug] Patient COUNT: ' + rs[0].length);
    var i = 0;
    for await (const v of rs[0]) {
        i = i + 1;
        log(`index loop : ${i}  [CID] : ${v.cid}`, false);
        await checkImmunizationHistoryCID(v.cid);
    }
    await getList()
}


async function checkInsertDataHistory(cid, dose) {
    return await model.checkInsertDataHistory(dbHIS, cid, dose)
}

async function getVaccineManufacturerID(text) {
    try {
        const rs = await model.getVaccineManufacturerID(dbHIS, text)
        return rs[0].vaccine_manufacturer_id
    } catch (error) {
        log('[WARNING]: ' + error);
    }
}
async function runJob() {
    // await checkToken();
    log('[runJob]', false);
    await getToken();
    setTimeout(() => {
        getVaccineBooking(process.env.TABLE_MULTIPLE)
            // getList()
            // getVaccineBookingTravel()        
        getFixBug()
            // checkImmunizationHistoryCID('1200900099000') //TEST DEBUG
    }, 100);
}
runJob();

var job = new CronJob('* * 1 * * *', function() {
    log('Renew Token Time: ' + moment().format('DD-MM-YYYY HH:mm:ss'));
    getToken();
}, null, true, 'Asia/Bangkok');
job.start();

//error handlers
if (process.env.NODE_ENV === 'development') {
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