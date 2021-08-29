const express = require('express');
const router = express.Router();
const axios = require('axios');
const HawkerStall = require('../models/hawkercentreAndStalls');

router.get('/', async (req,res) => {
    
    const limit = 500;
    const url = 'https://data.gov.sg/dataset/012e8dc8-631f-433c-aaa2-a9e975dc2ce4/resource/34f86c3e-a90c-4de9-a69f-afc86b7f31b6/data?limit='+limit;
    
    //const requestOne = await axios(config);
    // const requestTwo = axios(config1);
    // const requestThree = axios(config2);

    const responses = await axios.get(url);
    
   
    const hawkerStallArray = [];

    for (let i=0; i<responses.data.records.length; i++) {
        const premises_address = responses.data.records[i].premises_address;
        const centreAndStall = premises_address.split(" Stall No ");        
        const tempObj = {};
        tempObj['hawkercentre'] = centreAndStall[0];
        tempObj['stallnumber'] = centreAndStall[1];
        tempObj['name'] = centreAndStall[1];
        tempObj['grade'] = responses.data.records[i].grade;
        hawkerStallArray.push(tempObj);
    }

    await HawkerStall.collection.drop();
    await HawkerStall.insertMany(hawkerStallArray);

    res.send("Hawker Centre and Stalls Seeded");
    //res.render('index', {forecasts : responses[1].data.items[0].forecasts});   
    
});

router.get('/stall', async (req,res) => {
    
    await HawkerStall.updateOne({_id: "6120a3ca8456eaaa11946c2f"}, {
        name: "Azman Stall 1",
        foodItems: [
            {foodName: "Nasi Goreng", 
             price: 5, 
             description: "Fried rice with egg and chicken"
            },
            {foodName: "Chicken Rice", 
             price: 5, 
             description: "Chicken-flavoured rice with fried chicken"
            }
        ],
        tags: ["Malay", "spicy"],        
    });

    await HawkerStall.updateOne({_id: "6120a3ca8456eaaa11946c30"}, {
        name: "Atul Stall 2",
        foodItems: [
            {foodName: "Indian Rojak", 
             price: 6, 
             description: "Delicious spicy rojak items"
            },
            {foodName: "Curry Masala", 
             price: 5, 
             description: "Chicken in masala gravy"
            }
        ],
        tags: ["Indian", "spicy"],        
    });

    res.send("Hawker Stalls Seeded");
    //res.render('index', {forecasts : responses[1].data.items[0].forecasts});   
    
});

module.exports = router;