"use strict";
require("dotenv").config();
// const Knex = require('knex');
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const HttpStatus = require("http-status-codes");
const moment = require("moment");
const fs = require("fs");
const jwt = require('jsonwebtoken');
var mysql = require('mysql');
// @ts-ignore
const model = require("./model/model");
const modelAuth = require("./model/auth");
const res = require("express/lib/response");
const { title } = require("process");
const app = express();
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const axios = require("axios");
var dbHIS = require("knex")({
    client: "mysql",
    connection: {
        host: process.env.DB_HIS_HOST,
        user: process.env.DB_HIS_USER,
        port: +process.env.DB_HIS_PORT,
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
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'apiapp2'
});


// @ts-ignore
app.get("/", (req, res) =>
    res.send({
        ok: true,
        message: "Welcome to my api server!",
        code: HttpStatus.OK
    })
);
//////////////////////// notify//////////////////////////////////
app.get("/loop", (req, res) => {

 axios.get(`http://192.168.43.128:3000/get_position_token/12`,).then(function(response) {
        // console.log(response)
        const temp =response.data;
        // res.send(temp.token_staff);
        res.send(temp);
    })
    

    // const response = await axios.get(`http://192.168.43.128:3000/get_position_token/12`, {
    //     headers: {
    //         Authorization: `Bearer ${_token}`
    //     },
    //     httpsAgent: new https.Agent({
    //         rejectUnauthorized: false
    //     })
    // });
    //     res.send(temp);

})

app.get('/fcm_node/:room/:temp/:token_staff', (request, res) => {
// app.get('/fcm_node', (request, res) => {
const room = request.params.room;
    const temp = request.params.temp;
    const token_staff = request.params.token_staff;
    var FCM = require('fcm-node');
    var serverKey = 'AAAAuLTWD0E:APA91bGtpH7jbHhb6RGvR02I1GcpZaaSUhccY0Eg_KuwQT66oDWcUikTD7ojClDKDZE3LY3v2UwwnAm0TdhT9GXQgTlMMNrK3-6dMZbM0hBLNc9HduOeYG5Q1O-VFiaF6tn54Z99kt1v';
    var fcm = new FCM(serverKey);
// var token_staff='eGcz3Uz-Tq29C0cJjDLt_P:APA91bHA4CDcZA6RtIr6iBeXgnDB7PJiQiIDP12JFqBFVy2rSr6xzGFEXzqqKPo2QvK221PvNMWJoAfyqPRq7Cdj3sPf7VvhZGXKbsqOCju79DFnpDTOalkzlOVOverGRG77UDy5RrRU'
// var room ="ห้องไอที"  ;
// var temp = "30";
var message = {
	to:token_staff,
      
    notification: {
            title: 'แจ้งเตือนอุณหภูมิ',
            body: `${room} อุณหภูมิ${temp}`,
        },

        data: { //you can send only notification or only data(or include both)
            title: 'อุณหภูมิเกินที่กำหนด',
            body: '{"name" : "okg ooggle ogrlrl","product_id" : "123","final_price" : "0.00035"}'
        }

    };

    fcm.send(message, function(err, response) {
        if (err) {
            console.log("Something has gone wrong!"+err);
			console.log("Respponse:! "+response);
        } else {
            // showToast("Successfully sent with response");
            console.log("Successfully sent with response: ", response);

        }

    });

});
// app.get('/fcm_node', (request, res) => {
//     // app.get('/fcm_node', (request, res) => {
//     // const room = request.params.room;
//     //     const temp = request.params.temp;
//     //     const token_staff = request.params.token_staff;
//         var FCM = require('fcm-node');
//         var serverKey = 'AAAAuLTWD0E:APA91bGtpH7jbHhb6RGvR02I1GcpZaaSUhccY0Eg_KuwQT66oDWcUikTD7ojClDKDZE3LY3v2UwwnAm0TdhT9GXQgTlMMNrK3-6dMZbM0hBLNc9HduOeYG5Q1O-VFiaF6tn54Z99kt1v';
//         var fcm = new FCM(serverKey);
//     var token_staff='fpdaLYcqR_Cg7fdqpTrxlL:APA91bGBpU6-8XNEv_BnK2oFD43KRks8pKzpdOU-ErSR1NF3QHIarsLrc_3OzOd-VRP9gL4StQhFJe1jN2e6RQWXww5cJmdZ__MklYbNEDd_NEUL-XiRYjUxRu31syXqI_QKlJskJTvU'
//     var room ="ห้องไอที"  ;
//     var temp = "30";
//     var message = {
//         to:token_staff,
          
//         notification: {
//                 title: 'แจ้งเตือนอุณหภูมิ',
//                 body: `${room} อุณหภูมิ${temp}`,
//             },
    
//             data: { //you can send only notification or only data(or include both)
//                 title: 'อุณหภูมิเกินที่กำหนด',
//                 body: '{"name" : "okg ooggle ogrlrl","product_id" : "123","final_price" : "0.00035"}'
//             }
    
//         };
    
//         fcm.send(message, function(err, response) {
//             if (err) {
//                 console.log("Something has gone wrong!"+err);
//                 console.log("Respponse:! "+response);
//             } else {
//                 // showToast("Successfully sent with response");
//                 console.log("Successfully sent with response: ", response);
    
//             }
    
//         });
    
//     });
// app.get('/fcm_node', (request, res) => {
//     // const id_staff = request.params.id_staff;
//     // const token_staff = request.params.token_staff;
//     var FCM = require('fcm-node');
//     var serverKey = 'AAAAuLTWD0E:APA91bGtpH7jbHhb6RGvR02I1GcpZaaSUhccY0Eg_KuwQT66oDWcUikTD7ojClDKDZE3LY3v2UwwnAm0TdhT9GXQgTlMMNrK3-6dMZbM0hBLNc9HduOeYG5Q1O-VFiaF6tn54Z99kt1v';
//     var fcm = new FCM(serverKey);

//     var message = {
// 	to:'eGcz3Uz-Tq29C0cJjDLt_P:APA91bHA4CDcZA6RtIr6iBeXgnDB7PJiQiIDP12JFqBFVy2rSr6xzGFEXzqqKPo2QvK221PvNMWJoAfyqPRq7Cdj3sPf7VvhZGXKbsqOCju79DFnpDTOalkzlOVOverGRG77UDy5RrRU',
      
//     notification: {
//             title: 'แจ้งเตือนอุณหภูมิ2222',
//             body: 'ห้อง'+title,
//         },

//         data: { //you can send only notification or only data(or include both)
//             title: 'อุณหภูมิเกินที่กำหนด',
//             body: '{"name" : "okg ooggle ogrlrl","product_id" : "123","final_price" : "0.00035"}'
//         }

//     };

//     fcm.send(message, function(err, response) {
//         if (err) {
//             console.log("Something has gone wrong!"+err);
// 			console.log("Respponse:! "+response);
//         } else {
//             // showToast("Successfully sent with response");
//             console.log("Successfully sent with response: ", response);

//         }

//     });

// });

// db.query(`SELECT tb_temp.* FROM tb_temp JOIN room WHERE tb_temp.sensor_id='${sensor_id}'and tb_temp.room_id='${room_id}' and tb_temp.temp_temperature>='${temp}' and temp_datetime>= '${datetime}'AND room.id_position ='${id_position}' AND room.sensor_id =tb_temp.sensor_id;
// `,

app.get('/get_position_token/:id_position', (request, res) => {
    const id_position = request.params.id_position;
    db.query(`SELECT token_staff FROM staff WHERE id_position ='${id_position}';`, (err, result) => {
         var a =`'${result}'`;
        if (result != '') {
            res.send(
                result,
            );
        //  console.log(result);
        } else {
            res.send('No');
        }
    });
});


app.put("/updeta_token_staff/:id_staff/:token_staff", (request, response, next) => {
    const id_staff = request.params.id_staff;
    const token_staff = request.params.token_staff;
    let errors = false;
    if (!errors) {
        db.query(`UPDATE staff SET token_staff = '${token_staff}' WHERE staff.id_staff =${id_staff} `
           , (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',

                    });
                }
            })
    }

})


app.post('/set_tb_temp_notify_peek/:room_id/:sensor_id/:temp_temperature/:temp_humidity/:date_peek', (request, response) => {
    let room_id = request.params.room_id;
    let sensor_id = request.params.sensor_id;
    let temp_temperature= request.params.temp_temperature;
    let temp_humidity = request.params.temp_humidity;
    let date_peek = request.params.date_peek;
    db.query(`INSERT INTO temp_notify_peek (id_temp_peek,room_id,sensor_id,temp_temperature,temp_humidity,date_peek) 
    VALUES (NULL, '${room_id}', '${sensor_id}', '${temp_temperature}', '${temp_humidity}', '${date_peek}')`, (err, result) => {

      if (err) {
            response.send({
                ok: true,
                message: 'No',
            });
        } else {
            response.send({
                ok: true,
                message: 'yes',
            });
            console.log('dddddddddddd')
        }
    });
});
// app.delete('/delete_tb_temp_notify/:notitfy_id', (request, res) => {
//     let notitfy_id = request.params.notitfy_id;
//     db.query(`"DELETE FROM notify WHERE notify.notitfy_id = ${notitfy_id}"`, (err, result) => {

//         if (result != '') {
//             res.send('yes_delete_setnotify');
//         } else {
//             res.send('No');
//         }
//     });
// });
app.delete("/delete_tb_temp_notify/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM notify WHERE notify.notitfy_id = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


app.post('/set_tb_temp_notify', (request, response) => {
    let room_id = request.body.room_id;
    let sensor_id	 = request.body.sensor_id;
    let prescribe_temp = request.body.prescribe_temp;
    let id_position = request.body.id_position;
    db.query(`INSERT INTO notify (notitfy_id, room_id, sanser_id, prescribe_temp, Date, id_position) 
    VALUES (NULL,'${room_id}','${sensor_id}','${prescribe_temp}', current_timestamp(),'${id_position}')`, (err, result) => {

      if (err) {
            response.send({
                ok: true,
                message: 'No',
            });
        } else {
            response.send({
                ok: true,
                message: 'yes',
            });
            console.log('dddddddddddd')
        }
    });
});
app.get('/get_tb_temp_notify', (request, res) => {

    db.query(`SELECT * FROM tb_temp WHERE room_id = 1 AND sensor_id = 1 AND temp_temperature >= 20 AND temp_datetime >= '2022-03-09';`, (err, result) => {

        if (result != '') {
            res.send(result);
        } else {
            res.send('No');
        }
    });
});

app.get('/get_room/:id', (req, res) => {
    const id = req.params.id
    db.query(`SELECT * FROM room WHERE room_id = ${id}`, (err, result) => {

        if (result != '') {
            res.send(result);
        } else {
            res.send('No');
        }
    });
});

app.get('/get_notify', (request, res) => {

    db.query(`SELECT * FROM notify`, (err, result) => {

        if (result != '') {
            res.send(result);
        } else {
            res.send('No');
        }
    });
});

// SELECT tb_temp.* FROM `tb_temp`JOIN room WHERE tb_temp.sensor_id=2 and tb_temp.room_id=2 and tb_temp.temp_temperature>=25 and temp_datetime>= 2021-12-13 AND room.id_position =12 AND room.sensor_id =tb_temp.sensor_id;
app.get('/get_tb_temp_notify/:room_id/:sensor_id/:temp/:datetime/:id_position', (request, response) => {
    const room_id = request.params.room_id;
    const sensor_id = request.params.sensor_id;
    const temp = request.params.temp;
    const datetime = request.params.datetime;
    const id_position = request.params.id_position;
    
    db.query(`SELECT tb_temp.* FROM tb_temp JOIN room WHERE tb_temp.sensor_id='${sensor_id}'and tb_temp.room_id='${room_id}' and tb_temp.temp_temperature>='${temp}' and temp_datetime>= '${datetime}'AND room.id_position ='${id_position}' AND room.sensor_id =tb_temp.sensor_id;
    `, (err, result) => {

        if (result != '') {
                        response.send({
                            ok: true,
                            tb_temp: result[0],
                        });
                        // response.send(rs[0]);
                    }
                    else {
                        response.send({ tb_temp: null });
                        //  response.send("No");
                    }

    });
});

app.get('/get_tb_temp_notify_position/:id', (request, res) => {
    const id = request.params.id;
    const id_room = request.params.id_room;
    db.query(`SELECT * FROM notify WHERE  room_id = ${id}`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
// app.get('/get_tb_temp_notify/:room_id/:sensor_id/:temp/:datetime', (request, response) => {
//     const room_id = request.params.room_id;
//     const sensor_id = request.params.sensor_id;
//     const temp = request.params.temp;
//     const datetime = request.params.datetime;
//     db.query(`SELECT * FROM tb_temp WHERE room_id = '${room_id}' AND sensor_id = '${sensor_id}' AND temp_temperature >='${temp}' 
//     AND temp_datetime >= '${datetime}' ;`, (err, result) => {

//         if (result != '') {
//             response.send({
//                 ok: true,
//                 tb_temp: result[0],
//             });
//             // response.send(rs[0]);
//         }
//         else {
//             response.send({ tb_temp: null });
//             //  response.send("No");
//         }
//     });
// });



app.get('/get_teast/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const rs = await model.select(dbHIS, 'staff', ['first_name', 'last_name'], `id_staff=${id}`)
        res.send(rs)
    }
    catch (error) {
        res.send({ ok: false, message: error });
    }

})

app.get('/get_temp_all/:id', async (req, res) => {
    const id = req.params.id;
    const dateNow = moment().format('YYYY-MM-DD');
    try {
        const rs = await model.queueRaw(dbHIS, `SELECT * FROM senson WHERE room_id = ${id} `)
        var sensor = []
        for (let index = 0; index < rs[0].length; index++) {
            const element = rs[index];
            const temp = await model.select(dbHIS, "tb_temp", null, `room_id =${id} and sensor_id =${rs[0][index].sensor_id} `)
            const chart = await model.select(dbHIS, "tb_temp", null, `room_id =${id} and sensor_id =${rs[0][index].sensor_id} and temp_datetime LIKE  '${dateNow}%' limit 30`)
            sensor.push({ sensor_name: rs[0][index].sensor_name, temp: temp, chart: chart }) //
        }
        res.send(sensor)
    }
    catch (error) {
        res.send({ ok: false, message: error });
    }

})



app.get('/get_temp_table/:id', async (req, res) => {
    const id = req.params.id;
    const dateNow = moment().format('YYYY-MM-DD');
    try {
        const rs = await model.queueRaw(dbHIS, `SELECT * FROM senson WHERE room_id = ${id} `)
        var sensor = []
        for (let index = 0; index < rs[0].length; index++) {
            const element = rs[index];
            // console.log(rs[0][index]);
            // console.log('index',index)
            const temp = await model.select(dbHIS, "tb_temp", null, `room_id =${id} and sensor_id =${rs[0][index].sensor_id} `)
            const chart = await model.select(dbHIS, "tb_temp", null, `room_id =${id} and sensor_id =${rs[0][index].sensor_id} and temp_datetime LIKE  '${dateNow}%' limit 30`)
            sensor.push({ sensor_name: rs[0][index].sensor_name, temp: temp, chart: chart })
            // console.log(temp);

        }
        res.send(sensor)
    }
    catch (error) {
        res.send({ ok: false, message: error });
    }

})



app.get('/tb_temp_latest/:id/:id_room', (request, res) => {
    const id = request.params.id;
    const id_room = request.params.id_room;
    db.query(`SELECT * FROM tb_temp WHERE sensor_id ='${id}' AND room_id = '${id_room}' ORDER BY temp_datetime DESC LIMIT 1;`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


app.get('/temp_table/:id/:id_room', (request, res) => {
    const id = request.params.id;
    const id_room = request.params.id_room;
    db.query(`SELECT * FROM tb_temp WHERE sensor_id ='${id}' AND room_id = '${id_room}'ORDER BY temp_datetime DESC LIMIT 30;`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/temp_chart/:id/:id_room', (request, res) => {
    const id = request.params.id;
    const id_room = request.params.id_room;
    db.query(`SELECT * FROM tb_temp WHERE sensor_id ='${id}' AND room_id = '${id_room}' ORDER BY temp_datetime DESC LIMIT 10;`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


app.get('/get_tb_temp/:id/:id_room', (request, res) => {
    const id = request.params.id;
    const id_room = request.params.id_room;
    db.query(`SELECT * FROM tb_temp WHERE sensor_id ='${id}' AND room_id = '${id_room}' ORDER BY temp_datetimeDESC LIMIT 1;`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


app.get('/get_tb_temp/:id', (request, res) => {
    const id = request.params.id;

    db.query(`SELECT * FROM tb_temp WHERE room_id = '${id}'ORDER BY temp_datetime DESC LIMIT 2;`, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
app.get('/get_tb_temp', (req, res) => {
    db.query("SELECT * FROM `tb_temp` ORDER BY `temp_id` DESC LIMIT 1", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
app.get('/get_tb_temp_table', (req, res) => {
    db.query("SELECT * FROM `tb_temp` ORDER BY `temp_id` DESC LIMIT 30", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
app.get('/get_tb_temp_chat', (req, res) => {
    db.query("SELECT * FROM `tb_temp` ORDER BY `temp_id` DESC LIMIT 100", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.post('/tb_temp/:id/', (request, res) => {
    const id = request.params.id;
    let sensor_id = request.body.sensor_id;
    // let room_id = request.body.room_id;
    db.query(`SELECT room_id,sensor_id, temp_temperature, temp_humidity,temp_datetime FROM tb_temp WHERE sensor_id = 
    '${sensor_id}'and room_id='${id}' ORDER BY temp_id DESC LIMIT 1;`, id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.post('/get_tb_temp_datetime_between', (request, res) => {
    let datetime1 = request.body.datetime1;
    let datetime2 = request.body.datetime2;
    db.query(`SELECT * FROM tb_temp WHERE temp_datetime BETWEEN '${datetime1}' AND '${datetime2}'`, (err, result) => {

        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


app.post('/get_tb_temp_datetime_one_day', (request, res) => {

    let datetime1 = request.body.datetime1;
    let datetime2 = request.body.datetime2;
    db.query(`SELECT * FROM tb_temp WHERE temp_datetime >= '${datetime1}'LIMIT 10`, (err, result) => {

        if (result == '') {
            res.send(

                'No',
            );
        } else {
            res.send(result);
            console.log(result);
        }
    });
});




app.get('/apistaff', (req, res) => {
    db.query("SELECT * FROM `staff`", (err, result) => {
        // ("SELECT id_staff,first_name,last_name,username,password,image_staff,id_position,by_admin_id FROM `staff`"
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
app.get('/apistaff2', (req, res) => {
    db.query("SELECT username,id_position  FROM `staff`", (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
app.get('/apistaff/:id', (request, res) => {
    const id = request.params.id;
    db.query("SELECT * FROM `staff` WHERE id_staff = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/position_room/', (request, res) => {
    const id = request.params.id;
    db.query(`SELECT * from room `, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
app.get('/position_room/:id', (request, res) => {
    const id = request.params.id;
    db.query("SELECT * FROM `room` WHERE id_position = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
app.get('/apistaff_room', (request, res) => {
    db.query(`SELECT * from room `, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
app.get('/apiroom_id/:id', (request, res) => {
    const id = request.params.id;
    db.query(`SELECT * from room WHERE room_id = ?`, id, (err, result) => {

        if (err) {
            console.log(err);
        } else {
            res.send(result);

        }
    });

});
app.post('/addroom', (request, response, next) => {
    let room_name = request.body.room_name;
    let image_room = request.body.image_room;
    let sensor_id	 = request.body.sensor_id	;
    let id_position = request.body.id_position;
    let errors = false;
    if (!errors) {
        let form_data = {
            room_name: room_name,
            id_position: id_position
        }
        db.query(
        `INSERT INTO room (room_id, room_name, image_room,id_position,token_device,sensor_id)
         VALUES (NULL, '${room_name}','${image_room}','${id_position}', '', '${sensor_id}')`
        , (err, result) => {
            if (err) {
                response.send({
                    ok: true,
                    message: 'No',
                });
            } else {
                response.send({
                    ok: true,
                    message: 'yes',
                });
            }
        })
    }
})

app.post("/check_room_name", async (request, response) => {
    var room_name = request.body.room_name;
    try {
        // console.log(data);
        let rs = await modelAuth.check_room_name(dbHIS, room_name);
        if (rs[0].length == rs[0]) {
            response.send('ใช้งานได้');
        }
        else {
            response.send('ใช้งานได้ไปแล้ว');
        }
    } catch (error) {
        response.send({ ok: false, rows: error });
    }
})

app.delete("/delete_room/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM room WHERE room_id = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.put("/updeta_room/:id", (request, response, next) => {
    const id = request.params.id;
    let room_name = request.body.room_name;
    let image_room = request.body.image_room;
    let sensor_id = request.body.sensor_id;
    let id_position = request.body.id_position;
    let errors = false;
    if (!errors) {
        db.query(`UPDATE room SET 
        room_name = '${room_name}',
        image_room = '${image_room}',
        sensor_id = '${sensor_id}',
        id_position = '${id_position}'
        WHERE  room_id = ? `
            , id, (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',

                    });
                }
            })
    }

})

app.post('/drop_room', (request, response, next) => {
    let drop_room_name = request.body.drop_room_name;
    let drop_image_room = request.body.drop_image_room;
    let drop_api_degrees = request.body.drop_api_degrees;
    let drop_id_position = request.body.drop_id_position;
    let errors = false;
    if (!errors) {
        let form_data = {
            drop_room_name: drop_room_name,
            drop_id_position: drop_id_position
        }
        db.query(
            ` INSERT INTO drop_room (drop_id_room, drop_name_room, drop_image_room, drop_api_degrees, drop_id_position) 
        VALUES (NULL, '${drop_room_name}', '${drop_image_room}', '${drop_api_degrees}', '${drop_id_position}') `
            , (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',

                    });
                }
            })
    }
})
app.get('/Show_drop_room', (request, res) => {
    // var staff_room = request.body.staff_room;
    db.query(`SELECT * FROM drop_room `, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

//////////////////////////////////// CRUD_Room/////////////////////////////////
app.post("/login", async (request, response) => {
    var username = request.body.username;
    var password = request.body.password;
    try {
        // console.log(data);
        let rs = await modelAuth.login(dbHIS, username, password);
        // console.log(rs[0]);
        const token = jwt.sign({ username: username, username: username },
            process.env.JWT_KEY, {
            expiresIn: "1d",
        }
        );
        if (rs[0].length == 1) {
            console.log(rs[0], token);
            response.send({
                ok: true,
                access_lavel: rs[0],
                token: token,
                message: "User",
            });
            // response.send(rs[0]);
        }
        else {
            response.send({ token: null });
            //  response.send("No");
        }
    } catch (error) {
        response.send({ ok: false, rows: error });
    }
})
app.post("/login2", async (request, response) => {
    var username = request.body.username;
    var password = request.body.password;
    try {
        // console.log(data);
        let rs = await modelAuth.login2(dbHIS, username, password);
        // console.log(rs[0]);
        const token = jwt.sign({ username: username, username: username },
            process.env.JWT_KEY, {
            expiresIn: "1d",
        }
        );
        if (rs[0].length == 1) {
            console.log(rs[0], token);
            // response.send({
            //     ok: true,
            //     access_lavel: rs[0],
            //     token: token,
            //     message: "admin",

            // });
            response.send(rs[0]);
        } else {
            response.send(null);
        }
    } catch (error) {
        response.send({ ok: false, rows: error });
    }
})
app.post("/check_username", async (request, response) => {
    var username = request.body.username;
    try {
        // console.log(data);
        let rs = await modelAuth.check_user(dbHIS, username);
        if (rs[0].length == rs[0]) {
            // response.send({
            //     message: "ใช้งานได้",
            // });
            response.send('ใช้งานได้');
            // response.send(rs[0]);
        }
        else {
            response.send('ใช้งานได้ไปแล้ว');
        }
    } catch (error) {
        response.send({ ok: false, rows: error });
    }
})



app.post('/adduser', (request, response, next) => {
    let first_name = request.body.first_name;
    let last_name = request.body.last_name;
    let username = request.body.username;
    let password = request.body.password;
    let image_staff = request.body.image_staff;
    let name_position = request.body.name_position;
    let id_position = request.body.id_position;
    let errors = false;
    if (username.length === 0 || password.length === 0) {
        errors = true;
        // set flash message
        request.flash('error', 'Please enter name and author');
        // render to add.ejs with flash message
        res.render('books/add', {
            room_name: room_name,
            id_position: id_position
        })
    }
    // if no error
    if (!errors) {
        // insert query
        db.query(
            `INSERT INTO staff (id_staff, first_name, last_name, username, password, image_staff,name_position, id_position)
         VALUES (NULL,'${first_name}','${last_name}','${username}', MD5('${password}'), '${image_staff}', '${name_position}', '${id_position}')`

            , (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',
                    });
                }
            })
    }
})

app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM staff WHERE id_staff = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});



app.put("/updeta_user/:id", (request, response, next) => {
    const id = request.params.id;
    let first_name = request.body.first_name;
    let last_name = request.body.last_name;
    let username = request.body.username;
    let password = request.body.password;
    let image_staff = request.body.image_staff;

    let id_position = request.body.id_position;
    let name_position = request.body.name_position;
    let errors = false;

    if (!errors) {
        // insert query
        db.query(`UPDATE staff SET 
        first_name = '${first_name}',
        last_name = '${last_name}',
        username = '${username}',
        password = MD5('${password}'),
        image_staff = '${image_staff}',
        name_position = '${name_position}',
        id_position = '${id_position}'
        WHERE  id_staff = ?`
            , id, (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',

                    });
                }
            })
    }

})
app.post('/dropuser', (request, response, next) => {
    let first_name = request.body.first_name;
    let last_name = request.body.last_name;
    let username = request.body.username;
    let password = request.body.password;
    // let image_staff = request.body.image_staff;
    let name_position = request.body.name_position;
    let errors = false;

    if (!errors) {

        db.query(
            ` INSERT INTO drop_user (id_staff_drop, first_name_drop, last_name_drop, username_drop, password_drop
                ,name_position)
          VALUES (NULL, '${first_name}', '${last_name}', '${username}', '${password}', '${name_position}')`
            , (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',
                    });
                }
            })
    }
})

app.get('/Show_dropUser', (request, res) => {
    // var staff_room = request.body.staff_room;
    db.query(`SELECT * FROM drop_user `, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});
/////////////////////////////////////////////staff_position///////////////////////////
app.get('/staff_position_room/', (request, res) => {
    const id = request.params.id;
    db.query(`SELECT * from staff_position `, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/staff_position_room/:id', (request, res) => {
    const id = request.params.id;
    db.query(`SELECT * FROM staff_position WHERE id_position = ? `, id,(err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.post('/add_staff_position', (request, response) => {
    let name_position = request.body.name_position;
    let errors = false;
    if (!errors) {
        db.query(
            `INSERT INTO staff_position (id_position,name_position) VALUES (NULL, '${name_position}')`
            , (err, result) => {
                if (err) {
                    response.send('No');
                } else {
                    response.send(result);
                }
            })
    }
})

app.post("/check_staff_position", async (request, response) => {
    var name_position = request.body.name_position;
    try {
        // console.log(data);
        let rs = await modelAuth.check_position(dbHIS,name_position);
        if (rs[0].length == rs[0]) {
            // response.send({
            //     message: "ใช้งานได้",
            // });
            response.send('ใช้งานได้');
            // response.send(rs[0]);
        }
        else {
            response.send('ใช้งานได้ไปแล้ว');
        }
    } catch (error) {
        response.send({ ok: false, rows: error });
    }
})

app.put("/updeta_staff_position/:id", (request, response) => {
    const id = request.params.id;
    let name_position = request.body.name_position;
    let errors = false;

    if (!errors) {
        // insert query
        db.query(`UPDATE staff_position SET name_position = '${name_position}' WHERE staff_position.id_position = ${id}`
            , id, (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',

                    });
                }
            })
    }

})
app.delete("/delete_staff_position/:id", (req, res) => {
    const id = req.params.id;


    db.query(`DELETE FROM staff_position WHERE staff_position.id_position =${id} `, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


/////////////////////////////////////////////Sensor///////////////////////////
app.get('/sensor/', (request, res) => {
    const id = request.params.id;
    db.query(`SELECT * FROM senson `, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.get('/sensor/:id', (request, res) => {
    const id = request.params.id;
    db.query(`SELECT * FROM senson WHERE sensor_id = ? `, id,(err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.post('/add_sensor', (request, response) => {
    let sensor_id = request.body.sensor_id;
    let sensor_name = request.body.sensor_name;
    let errors = false;
    if (!errors) {
        db.query(
            `INSERT INTO senson (sensor_id, sensor_name) VALUES ('${sensor_id}', '${sensor_name}')`
            , (err, result) => {
                if (err) {
                    response.send('No');
                } else {
                    response.send(result);
                }
            })
    }
})

app.post("/check_sensor", async (request, response) => {
    var sensor_name = request.body.sensor_name;
    try {
        // console.log(data);
        let rs = await modelAuth.check_sensor_name(dbHIS,sensor_name);
        if (rs[0].length == rs[0]) {
            // response.send({
            //     message: "ใช้งานได้",
            // });
            response.send('ใช้งานได้');
            // response.send(rs[0]);
        }
        else {
            response.send('ใช้งานได้ไปแล้ว');
        }
    } catch (error) {
        response.send({ ok: false, rows: error });
    }
})

app.put("/updeta_sensor/:id", (request, response) => {
    const id = request.params.id;
    let name_position = request.body.name_position;
    let errors = false;

    if (!errors) {
        // insert query
        db.query(`UPDATE senson SET sensor_name = '${name_position}' WHERE senson.sensor_id = ${id}`
            , id, (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',

                    });
                }
            })
    }

})
app.delete("/delete_sensor/:id", (req, res) => {
    const id = req.params.id;


    db.query(`DELETE FROM senson WHERE senson.sensor_id =${id} `, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});



////////////////////////////////////////////// CRUD User///////////////////////////////////////////
app.get('/getadmin', (request, res) => {
    db.query(`SELECT * FROM staff_admin`, (err, result) => {

        if (err) {
            console.log(err);
        } else {
            res.send(

                result,
            );
        }
    });
});


app.post('/add_admin', (request, response, next) => {
    let username = request.body.username;
    let image_staff = request.body.image_staff;
    let password = request.body.password;
    let errors = false;
    if (username.length === 0 || password.length === 0) {
        errors = true;
        // set flash message
        request.flash('error', 'Please enter name and author');
        // render to add.ejs with flash message
        res.render('books/add', {
            username: username
        })
    }
    // if no error
    if (!errors) {
        // insert query
        db.query(`INSERT INTO staff_admin SET 
        username = '${username}', 
        image_staff = '${image_staff}',
        password = '${password}' `,
            (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',

                    });
                }
            })
    }
})

app.delete("/delete_admin/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM staff_admin WHERE id_staffadmin = ?", id, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

app.put("/updeta_admin/:id", (request, response, next) => {
    const id = request.params.id;
    let username = request.body.username;
    let image_staff = request.body.image_staff;
    let password = request.body.password;
    let errors = false;

    if (!errors) {
        db.query(`UPDATE staff_admin SET username = '${username}', password = '${password}', image_staff = '${image_staff}'`
            , id, (err, result) => {
                if (err) {
                    response.send({
                        ok: true,
                        message: 'No',
                    });
                } else {
                    response.send({
                        ok: true,
                        message: 'yes',

                    });
                }
            })
    }

})


////////////////////////////////////////////// CRUD User///////////////////////////////////////////



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
var port = +process.env.PORT || 3000;
app.listen(port, () => console.log(`Api listening on port ${port}!`));
