//DEPENDENCIES
require('dotenv').config();
const express = require('express');
const router3 = express.Router();
const multer = require('multer');
const imgur = require('imgur');
const fs = require('fs');
const methodOverride = require('method-override');

const { requireAuth } = require('../middleware/authMiddleware');

//Models
const HawkerStall = require('../models/hawkercentreAndStalls');
const HawkerCentreOnly = require('../models/hawkercentreOnly');
const User = require('../models/user');



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
router3.use(express.urlencoded({ extended: true }));
router3.use(methodOverride("_method"));
router3.use(uploadMiddleware.any());

//routes
router3.get('/', async (req, res) => {
    
    let searchHawkerCentre;

    if (req.query.name.includes("BLK")) {
        const tempArray = req.query.name.split(" BLK ");
        searchHawkerCentre = `BLK ${tempArray[1]} ${tempArray[0]}`;
        
    } else if (req.query.name.includes("BLKS")) {
        const tempArray = req.query.name.split(" BLKS ");
        searchHawkerCentre = `BLKS ${tempArray[1]} ${tempArray[0]}`;        
    } else {
        searchHawkerCentre = req.query.name;
    }    

    const result = await HawkerStall.find({hawkercentre: req.query.name});    
    const hawkerCentreData = await HawkerCentreOnly.find({name: searchHawkerCentre});    

    res.render('hawkercentre', {
        hawkercentre: req.query.name,
        data: result,
        dataHC: hawkerCentreData[0] });
});

//exposing my hawkercentre coordinates
router3.get('/coordinates', async (req,res) => {
    const result = await HawkerCentreOnly.find({}, 'name longitude latitude');
    res.json(result);
})

router3.get('/:id', async (req,res) => {
    const result = await HawkerStall.find({_id: req.params.id});
    res.render('hawkershow', {data: result[0]});
});

router3.get('/:id/edit', requireAuth, async (req,res) => {
    const result = await HawkerStall.find({_id: req.params.id});
    res.render('hawkeredit', {data: result[0]});
});

router3.put('/:id', async (req,res) => {
    // Change this cliend id to your own.
    const clientId = process.env.IMGUR_ID;

    // Setting
    imgur.setClientId(clientId);

    let tagsArray = [];
    if (req.body.tags !== undefined) {
        tagsArray = req.body.tags.split(",");
    }

    const tempObj = {
        name: req.body.name,        
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
    
    const file = req.files[0];

    try {
        const urlImage = await imgur.uploadFile(`./uploads/${file.filename}`);
        fs.unlinkSync(`./uploads/${file.filename}`);
        
        tempObj.img = urlImage.link;

        await HawkerStall.updateOne({_id: req.params.id}, tempObj);
        await User.updateOne({_id: req.body.userId}, {$push: { editedPosts: editedPost }} );

    } catch(err) {
        console.log(err);

    }
    
    
    res.redirect(`/hawkercentre/${req.params.id}`);
});



module.exports = router3;