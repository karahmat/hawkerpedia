const express = require('express');
const router2 = express.Router();
const HawkerStall = require('../models/hawkercentreAndStalls');

router2.get('/', async (req, res) => {
    const result = await HawkerStall.find().distinct('hawkercentre').exec();
    
    const firstLetter = [];
    for ( const element of result ) {
        if (firstLetter.indexOf(element.charAt(0).toUpperCase()) === -1) {
            firstLetter.push(element.charAt(0).toUpperCase());
        }
    }
      

    res.render('index', {
        data: result,
        navigation: firstLetter});
});




module.exports = router2;