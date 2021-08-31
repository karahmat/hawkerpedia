//DEPENDENCIES
const express = require('express');
const router3 = express.Router();
const HawkerStall = require('../models/hawkercentreAndStalls');
const User = require('../models/user');
const { requireAuth } = require('../middleware/authMiddleware');
const methodOverride = require('method-override');

//Middleware
router3.use(express.urlencoded({ extended: true }));
router3.use(methodOverride("_method"));

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
    
    let tagsArray = [];
    if (req.body.tags !== undefined) {
        tagsArray = req.body.tags.split(",");
    }

    const tempObj = {
        name: req.body.name,
        img: req.body.img,
        tags: tagsArray
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
    
    const editedPost = {
        hawkercentre: req.body.hawkercentre,
        stallnumber: req.body.stallnumber,
        editDate: new Date()
    };
    

    await HawkerStall.updateOne({_id: req.params.id}, tempObj)
    await User.updateOne({_id: req.body.userId}, {$push: { editedPosts: editedPost }} )
    res.redirect(`/hawkercentre/${req.params.id}`);
})

module.exports = router3;