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


app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/', (req, res) => res.send({ ok: true, message: 'Welcome to my api server!', code: HttpStatus.OK }));

app.get('/check/:cid', async(req, res) => {
    var cid = req.params.cid;
    try {
        await getToken();
        // const rs = await checkImmunizationHistoryCID(cid)
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
    fs.appendFileSync('./log.log', `${_text}\n`);
    if (!log) {
        fs.appendFileSync('./error_log.log', `${_text}\n`);
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
    log(`[GET Token]` + _token, false);
}

async function checkImmunizationHistoryCID(cid) {
    try {
        // @ts-ignore
        await delay(process.env.URL_API_CALL_DELAY_MS);
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
                const manufacturer_id = await getVaccineManufacturerID(strVaccine_ref_name);
                const data = await {
                        cid: cid,
                        vaccine_dose_no: dose_no,
                        vaccine_datetime: v.visit_datetime,
                        vaccine_name: v.visit_immunization[0].vaccine_ref_name,
                        vaccine_manufacturer_id: manufacturer_id,
                        vaccine_lot_number: v.visit_immunization[0].lot_number,
                        hospital_code: v.hospital_code,
                        hospital_name: v.hospital_name,
                        visit_guid: v.visit_guid
                    }
                    // console.log(`v.visit_immunization[0].vaccine_ref_name : ${v.visit_immunization[0].vaccine_ref_name.substring(a+1,b)}`);
                    // console.log(data);
                const ck = await checkInsertDataHistory(cid, dose_no)
                    // console.log(ck.length);
                if (ck.length == 0 && manufacturer_id != null) {
                    log('[UPDATE] CID: ' + cid, false);
                    await model.insertDataHistory(dbHIS, data)
                } else if (ck.length == 0 && manufacturer_id == null) {
                    log('[NO UPDATE] manufacturer_id NULL' + cid, false);
                } else {
                    log(`[NO UPDATE] CID & DOSE Duplicate ${cid}[${dose_no}]`, false);
                }
            });
        } else {
            log('[NO UPDATE] CID:' + cid, false);
        }
        return response.data.result;
    } catch (error) {
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
        log('index loop: ' + i, false);
        await checkImmunizationHistoryCID(v.cid);
    }
    log('[END] getList...', false);
    await getList();

}
async function checkInsertDataHistory(cid, dose) {
    return await model.checkInsertDataHistory(dbHIS, cid, dose)
}

async function getVaccineManufacturerID(text) {
    try {
        const rs = await model.getVaccineManufacturerID(dbHIS, text)
        return rs[0].vaccine_manufacturer_id
    } catch (error) {
        console.log('[WARNING]: ' + error);
    }
}
async function runJob() {
    // await checkToken();
    log('[runJob]', false);
    await getToken();
    setTimeout(() => {
        getList()
    }, 100);
}
runJob();

var job = new CronJob('* 1 * * *', function() {
    log('Renew Token Time: ' + moment().format('DD-MM-YYYY HH:mm:ss'));
    getToken();
}, null, true, 'Asia/Bangkok');
job.start();

//error handlers
if (process.env.NODE_ENV === 'development') {
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