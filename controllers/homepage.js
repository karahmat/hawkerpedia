const express = require('express');
const router2 = express.Router();
const HawkerStall = require('../models/hawkercentreAndStalls');

router2.get('/', async (req, res) => {
    const result = await HawkerStall.find().distinct('hawkercentre').exec();
    
    for (let i=0; i<result.length; i++) {
        if (result[i].includes('BLK') || result[i].includes('Blk')) {
            let blk, blknumber, rest;
            let tempArray = result[i].split(' ');
            tempArray =  tempArray.map( (item) => {
                return item.toUpperCase()});

            [blk, blknumber, ...rest] = tempArray;
            if (blk === "BLK") {
                result[i] = `${rest.join(' ')} BLK ${blknumber}`;
            }
        }
    }
    result.sort();

    const firstLetter = [];
    for ( const element of result ) {
        if (firstLetter.indexOf(element.charAt(0).toUpperCase()) === -1) {
            firstLetter.push(element.charAt(0).toUpperCase());
        }
    }
    firstLetter.sort();

    
      

    res.render('index', {
        data: result,
        navigation: firstLetter});
});


module.exports = router2;