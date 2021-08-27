module.exports = {
    getList(db) {
        return db('patient AS p')
            .select('p.*')
            .leftJoin('moph_vaccine_history_api AS m', 'm.cid', 'p.cid')
            .where('m.cid', null)
            .where('p.cid', 'not like', '010733%')
            .where('p.death', '<>', 'Y')
    },
    checkInsertDataHistory(db, cid, dose) {
        return db(process.env.DB_HIS_TABLE_NAME_UPDATE)
            .where('cid', cid)
            .where('vaccine_dose_no', dose)
    },
    insertDataHistory(db, data) {
        return db(process.env.DB_HIS_TABLE_NAME_UPDATE).insert(data)
    },
    getVaccineManufacturerID(db, text) {
        return db('vaccine_manufacturer')
            .where('vaccine_manufacturer_name', text)
    },
    getVaccineBookingTravel(db) {
        return db('vaccine_booking_travel')
    },
    getDataFormTable(db, table) {
        return db(table)
    },
    getFixBug(db) {
        const sql = 'SELECT cid, person_name, vaccine1_nickname, immunized1_datetime, vaccine2_nickname, immunized2_datetime, vaccine3_nickname, immunized3_datetime FROM immunized_person WHERE immunized_type_id=1 ORDER BY immunized1_datetime, immunized2_datetime, immunized3_datetime';
        return db.raw(sql)
    }
};