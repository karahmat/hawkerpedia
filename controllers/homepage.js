const express = require('express');
const router2 = express.Router();
const HawkerStall = require('../models/hawkercentreAndStalls');

router2.get('/', async (req, res) => {
    const result = await HawkerStall.find().distinct('hawkercentre').exec();
    res.render('index', {data: result});
});

router2.get('/login', async (req,res) => {
    res.render('loginPage');
})

router2.get('/register', async (req,res) => {
    res.render('registerPage');
})

module.exports = router2;