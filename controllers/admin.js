//DEPENDENCIES
require('dotenv').config();
const express = require('express');
const router = express.Router();
const multer = require('multer');
const imgur = require('imgur');
const fs = require('fs');
const methodOverride = require('method-override');
const { requireAuth } = require('../middleware/authMiddleware');

// ==== 
// set up for multer diskstorage
// ====
const diskStorage = multer.diskStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  })

// after you setup multer to choose your disk storage, you can initialize a middleware to use for your routes
const uploadMiddleware = multer({ storage: diskStorage });

//Middleware
router.use(express.urlencoded({ extended: true }));
router.use(methodOverride("_method"));
router.use(uploadMiddleware.any());

//Models
const HawkerCentreOnly = require('../models/hawkercentreOnly');
const HawkerStall = require('../models/hawkercentreAndStalls');
const User = require('../models/user');

//Routes

router.get('/hawkercentre/edit', requireAuth, async(req,res) => {
    try {        

        const hawkerCentreData = await HawkerCentreOnly.find();        
        res.render('adminpageEditHC', {            
            allHawkerCentres: hawkerCentreData,
            chosenHawkerCentre: req.query.id });

    } catch (err) {
        console.log(err);
    }
});

router.put('/hawkercentre/edit/:id', async (req,res) => {
            
    const tempObj = {
        address: req.body.address,
        postalcode: req.body.postalcode, 
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        numberofstalls: req.body.numberofstalls
    }

    try {
        await HawkerCentreOnly.updateOne({_id: req.params.id}, tempObj);
        const hawkerCentreName = await HawkerCentreOnly.find({_id: req.params.id}, 'name');            
        res.redirect(`/hawkercentre/?name=${hawkerCentreName[0].name}`)        
    } catch (err) {
        console.log(err);
    }

});

router.get('/hawkercentre/add', requireAuth, (req,res) => {

    res.render('adminpageAddHC');

});


router.post('/hawkercentre/add', requireAuth, async (req,res) => {
    console.log(req.body);
    let tempObj = {};
    tempObj["name"] = req.body.name;
    tempObj["address"] = req.body.address;
    tempObj["longitude"] = req.body.longitude;
    tempObj["latitude"] = req.body.latitude;
    tempObj["postalcode"] = parseInt(req.body.postalcode);
    tempObj["numberofstalls"] = req.body.numberofstalls;

    try {
        await HawkerCentreOnly.create(tempObj);
        res.redirect('/');
    } catch (err) {
        console.log(err);
    }

});

router.get('/hawkerstall/add', requireAuth, async (req,res) => {

    try {
        const hawkerCentreData = await HawkerCentreOnly.find();   
        res.render('adminpageAddStall', {
            allHawkerCentres: hawkerCentreData,
            chosenHawkerCentre: req.query.name });
    } catch (err) {
        console.log(err);
    }  

});


router.post('/hawkerstall/new', requireAuth, async (req,res) => {

    console.log(req.body);

    // Change this cliend id to your own.
    const clientId = process.env.IMGUR_ID;

    // Setting
    imgur.setClientId(clientId);

    let tagsArray = [];
    
    if (req.body.tags !== undefined) {
        tagsArray = req.body.tags.split(",");
    }

    let hawkerCentreName;

    if (req.body.hawkercentre.includes('BLK')) {
        let blk, blknumber, rest;
        let tempArray = req.body.hawkercentre.split(' ');
        
        [blk, blknumber, ...rest] = tempArray;
        if (blk === "BLK") {
            hawkerCentreName = `${rest.join(' ')} BLK ${blknumber}`;
        }
    } else {
        hawkerCentreName = req.body.hawkercentre;
    }

    const tempObj = {
        hawkercentre: hawkerCentreName,
        name: req.body.name, 
        stallnumber: req.body.stallnumber,       
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

    try {
        if (req.files[0]) {
            const file = req.files[0];
            const urlImage = await imgur.uploadFile(`./uploads/${file.filename}`);
            fs.unlinkSync(`./uploads/${file.filename}`);
            
            tempObj.img = urlImage.link;
        }

        const newHawkerStall = await HawkerStall.create(tempObj);
        await User.updateOne({_id: req.body.userId}, {$push: { editedPosts: editedPost }} );
        res.redirect(`/hawkercentre/${newHawkerStall._id}`);

    } catch(err) {
        console.log(err);

    }
     
});


router.get('/user/edit', requireAuth, async(req,res) => {
    
    try {
        const usersData = await User.find();        
        res.render('adminpageEditUser', { 
            allUsers: usersData,
            chosenUsernameID: req.query.id });
    } catch (err) {
        console.log(err);
    }

});

router.put('/user/edit/:id', requireAuth, async (req,res) => {
    //console.log(req.body.access);
    try {
        const user = await User.updateOne({_id: req.params.id}, {access: req.body.access});
        res.redirect(`/admin/user/edit?id=${req.params.id}`);
    } catch (err) {
        console.log(err);
    }
});





module.exports = router;