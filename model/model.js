module.exports = {

    insert(db, table, data) {
        return db(table).insert(data)
    },
    select(db, table, select = '*', where = null) {
        if (where) {
            return db(table).select(select).whereRaw(where)
        } else {
            return db(table).select(select);
        }
    },

    queueRaw(db, query) {
        return db.raw(query)
    },
    update(db, table, data, where) {
        return db(table).update(data).whereRaw()
    },
    delete(db, table, where) {
        return db(table).whereRaw(where).del()

    }


};