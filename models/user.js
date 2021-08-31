const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String, 
        required: [true, 'Please enter an email'], 
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String, 
        required: [true, 'Please enter a password'],
        minlength: [8, 'Minimum password length is 8 characters']
    },
    code: {
        type: String,
        required: [true, 'Please enter referrer code']
    },
    access: {
        type: String,
        minlength: [5, 'Referrer does not exist'],
        required: [true, 'Referrer does not exist']        
    },    
    editedPosts: [ 
        {   
            hawkercentre: String,                 
            stallnumber: String, 
            editDate: String             
        } 
    ]  
});

//fire a function after doc saved to db
// userSchema.post('save', (doc, next) => {
//     console.log('new user was created and saved', doc);
//     next();
// });

//fire a function before doc saved to db 
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//static method to login user
userSchema.statics.login = async function (username, password) {
    const user = await this.findOne({ username });

    //if we have a user
    if (user) {
        //auth can be true or false
        const auth = await bcrypt.compare(password, user.password);
        
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect username');
}

const User = mongoose.model('user', userSchema);

module.exports = User;