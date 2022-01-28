module.exports = {
    getList(db) {
        return db('patient AS p')
            .select('p.*')
            .leftJoin('moph_vaccine_history_api AS m', 'm.cid', 'p.cid')
            .where('m.cid', null)
            .where('p.cid', 'not like', '010733%')
            .where('p.death', '<>', 'Y')
            .where('p.cid', '<>', '0000000000000')
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
        const sql = `SELECT * from moph_vaccine_history_api WHERE immunization_datetime is null`;
        return db.raw(sql)
    },
    updateDataHistory(db, data, moph_vaccine_history_id) {
        return db('moph_vaccine_history_api')
            .update(data)
            .where('moph_vaccine_history_id', moph_vaccine_history_id)
    }
};