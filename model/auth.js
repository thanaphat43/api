module.exports = {
    login(db, user, password) {
        const sql = `SELECT loginname,name from opduser WHERE loginname = '${user}' AND passweb = MD5('${password}') AND account_disable='N'`;
        return db.raw(sql)
    }
}