

module.exports = {

  login(dbHIS, username, password) {
    const sql = `SELECT * from staff  WHERE username = '${username}' AND password = MD5('${password}') `;
   
    // const sql = `SELECT id_staff,first_name,last_name,username,image_staff,id_position,by_admin_id from staff 
    //  WHERE username = '${username}'  AND password ='${password}' `;
    // const sql = `SELECT * from staff 
    // WHERE username = '${username}'  AND password ='${password}' `;

    // "id_staff": 68,
    //     "first_name": "ธนภัทร์",
    //     "last_name": "ปิ่นทอง",
    //     "username": "khiw",
    //     "password": "e10adc3949ba59abbe56e057f20f883e",
    //     "image_staff": "https://firebasestorage.googleapis.com/v0/b/appflutter-80d14.appspot.com/o/Khiw.jpg?alt=media&token=42837233-c262-45f9-bd64-ed87932aa4ac",
    //     "name_position": "student",
    //     "id_position
     
    return dbHIS.raw(sql)
  },

  login2(dbHIS, username, password) {
    // const sql = `SELECT * from staff  WHERE username = '${username}' AND password = '${password}' `;
    const sql = `SELECT * from staff_admin WHERE username = '${username}'  AND password = ('${password}') `;

    return dbHIS.raw(sql)
  },


  check_user(dbHIS, username) {
    const sql = `SELECT * from staff  WHERE username = '${username}' `;
    return dbHIS.raw(sql)
  },

  check_room_name(dbHIS, room_name) {
    const sql = `SELECT * from room  WHERE room_name = '${room_name}' `;
    return dbHIS.raw(sql)
  },
check_position(dbHIS, name_position) {
    const sql = `SELECT * FROM staff_position WHERE name_position LIKE '${name_position}' `;
    return dbHIS.raw(sql)
  },

  check_sensor_name(dbHIS, sensor_name) {
    const sql = `SELECT * FROM senson WHERE sensor_name LIKE '${sensor_name}' `;
    return dbHIS.raw(sql)
  },

  apistaff(dbHIS) {
    // const sql = `SELECT * from staff  WHERE username = '${username}' AND password = '${password}' `;
    const sql = "SELECT * FROM `staff`";

    return dbHIS.raw(sql)
  },
  apistaff_admin(db) {
    // const sql = `SELECT * from staff  WHERE username = '${username}' AND password = '${password}' `;
    const sql = "SELECT * FROM `staff_admin`";

    return db.raw(sql)
  },


  check_datetime(dbA, datetime1) {
    const sql = `SELECT * FROM tb_temp WHERE temp_datetime = '${datetime1}'`;
    return dbA.raw(sql)
  },

};