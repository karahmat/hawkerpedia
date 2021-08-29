const express = require('express');
const Bottleneck = require('bottleneck');
const router = express.Router();
const axios = require('axios');
const HawkerCentreOnly = require('../models/hawkercentreOnly');

const limiter = new Bottleneck({
    minTime: 250    
});

async function getCoordinates(url) {
    const results = await axios.get(url);    
    return results;    
}

const throttledGetMyData = limiter.wrap(getCoordinates);

router.get('/', async (req,res) => {
    
    
    const url = 'https://data.gov.sg/api/action/datastore_search?resource_id=8f6bba57-19fc-4f36-8dcf-c0bda382364d';
    
    const responses = await axios.get(url);    
    const hawkerCentreArray = [];

    await HawkerCentreOnly.collection.drop();

    for (let i=0; i<responses.data.result.records.length; i++) {
        const location = responses.data.result.records[i].location_of_centre;
        const postalCode_temp = location.split("S(");
        let postalCode = postalCode_temp[1].slice(0,-1);    
        console.log(postalCode);    
        
        if (postalCode.includes("/")) {
            postalCode = postalCode.split("/")[0];
        }

        const tempObj = {};
        tempObj['name'] = responses.data.result.records[i].name_of_centre;
        tempObj['numberofstalls'] = parseInt(responses.data.result.records[i].no_of_stalls);
        tempObj['address'] = location;
        tempObj['postalcode'] = parseInt(postalCode);
        
        const url2 = `https://developers.onemap.sg/commonapi/search?searchVal=${postalCode}&returnGeom=Y&getAddrDetails=Y`;
        const responses2 = await throttledGetMyData(url2);
        
        if (typeof responses2.data.results[0] !== "undefined") {
            const longitude = responses2.data.results[0].LONGITUDE;
            const latitude = responses2.data.results[0].LATITUDE;               
            tempObj['longitude'] = parseFloat(longitude);
            tempObj['latitude'] = parseFloat(latitude);           
        }

        hawkerCentreArray.push(tempObj);
    }

    
    await HawkerCentreOnly.insertMany(hawkerCentreArray);

    res.send('Hawker Centre Seed done for all');
    
    
});


module.exports = router;