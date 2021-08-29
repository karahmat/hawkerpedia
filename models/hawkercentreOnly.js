const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hawkerCentreSchema = new Schema(
    {
        name: {
            type: String, 
            required: true
        },
        numberofstalls: Number,
        address: {
            type: String, 
            required: true
        },
        postalcode: {
            type: Number,
            required: true
        }, 
        longitude: Number,
        latitude: Number
    }, 
    {
        timestamps: true
    }
);

const HawkerCentreOnly = mongoose.model("HawkerCentreOnly", hawkerCentreSchema);

module.exports = HawkerCentreOnly;