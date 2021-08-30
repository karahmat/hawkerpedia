const express = require('express');
const router3 = express.Router();
const HawkerStall = require('../models/hawkercentreAndStalls');
const { requireAuth } = require('../middleware/authMiddleware');

router3.get('/', async (req, res) => {
        
    const result = await HawkerStall.find({hawkercentre: req.query.name}, 'stallnumber');    
    res.render('hawkercentre', {
        hawkercentre: req.query.name,
        data: result});
});

router3.get('/:id', async (req,res) => {
    const result = await HawkerStall.find({_id: req.params.id});
    res.render('hawkershow', {data: result[0]});
});

router3.get('/:id/edit', requireAuth, async (req,res) => {
    const result = await HawkerStall.find({_id: req.params.id});
    res.render('hawkeredit', {data: result[0]});
});

router3.put('/:id', async (req,res) => {
    const tempObj = {
        name: req.body.name,
        img: req.body.img,
        tags: req.body.tags.split(",")
    };
    tempObj["foodItems"] = [];
    for (let i=0; i<req.body.foodName.length; i++) {
        if (req.body.foodName[i] !== '') {
            tempObj["foodItems"][i] = {
                foodName: req.body.foodName[i],
                price: parseFloat(req.body.price[i]),
                description: req.body.description[i]
            }
        }
    } 
    console.log(req.params.id);
    await HawkerStall.updateOne({_id: req.params.id}, tempObj)
    res.redirect(`/hawkercentre/${req.params.id}`);
})

module.exports = router3;