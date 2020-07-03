"use strict";

const models = require('../models');
const filteredProfileModel = models.filtered_profile;

const fetchAllFilterProflie = async (req, res, next) => {
    try{
        let profileInfo = await filteredProfileModel.findAll({ raw:true });
        return res.status(200).json({ rows: profileInfo});

    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}

const addFilterProfile = async (req, res, next) => {
    try{

        // const { from_account_id,
        //     to_account_id,
        //     from_account_dateFrom,
        //     from_account_dateTo:,
        //     from_symbols,
        //     to_account_dateFrom,
        //     to_account_dateTo,
        //     to_symbols } = req.body;

        const record = req.body;
     
        await filteredProfileModel.create(record);
        let profileInfo = await filteredProfileModel.findAll({ raw:true });

        return res.status(200).json({ rows: profileInfo});
    
    } catch(err) {
        return res.status(err.status || 500).json(err);
    };
}


module.exports = {
    fetchAllFilterProflie, addFilterProfile
};
