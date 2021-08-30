const express = require('express');
const router2 = express.Router();
const HawkerStall = require('../models/hawkercentreAndStalls');

router2.get('/', async (req, res) => {
    const result = await HawkerStall.find().distinct('hawkercentre').exec();
    res.render('index', {data: result});
});




module.exports = router2;