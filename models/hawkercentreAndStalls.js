const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hawkerStallSchema = new Schema(
    {
        name: {
            type: String, 
            required: [true, 'Please enter stall name']
        },
        img: String, 
        hawkercentre: {
            type: String, 
            required: [true, 'Please enter hawker centre']
        },
        stallnumber: {
            type: String, 
            required: false            
        },
        grade: String,
        tags: [String],
        foodItems: [ 
            {   
                foodName: String,                 
                price: Number, 
                description: String
            } 
        ],
        lastEditedBy: String  
    }, 
    {
        timestamps: true
    }
);

const HawkerStall = mongoose.model("HawkerStall", hawkerStallSchema);

module.exports = HawkerStall;