require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { requireAuth } = require('../middleware/authMiddleware');

//function to handle errors
const handleErrors = (err) => {
    console.log("handleErrors function is called");
    console.log(err.message);
    let errors = { username: '', password: '', access: '' };

    //incorrect username
    if (err.message === "incorrect username") {
        errors.username = "That username is not registered";
    }

    //incorrect password
    if (err.message === "incorrect password") {
        errors.password = "That username and/or password is incorrect";
    }

    //duplicate error code 
    if (err.code === 11000) {
        errors.username = "That email is already registered";
        return errors;
    }

    
    //validation errors
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(item => {
            errors[item.properties.path] = item.properties.message;            
        });
    }

    return errors;
}

//check whether referrer ID exists
const checkReferrer = async (code) => {
    
    try {
        const isExistingBureaucrat = await User.exists({ _id: code });
        //const isExistingBureaucrat = false;
        
        let access;
        
        if (code == process.env.ADMIN_CODE) {
            access = "administrator";
        } else if (isExistingBureaucrat) {
            access = "bureaucrat";
        } else if (isExistingBureaucrat === false) {
            access = "";
        }
                
        return access;
    } 
    catch (err) {
        console.log(err);
    }
}

const maxAge = 3 * 24 * 60 * 60; //in seconds
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge,
    });
};



router.get('/register', (req,res) => {
    res.render('registerPage');
});

router.post('/register', async (req,res) => {
    const { username, password, code } = req.body;    
    
    try {  
        const access = await checkReferrer(code);
        
        const user = await User.create({username, password, code, access});
        const token = createToken(user._id);
        //send cookie to browser, but it cannot be accessed by clicking document.cookie due to httpOnly: true
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}); //maxAge in milliseconds here
        res.status(201).json( { user: user._id });   
    }
    catch (err) {                    
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
    
});

router.get('/login', (req,res) => {
    res.render('loginPage');
});

router.post('/login', async (req,res) => {
    const {username, password} = req.body;
    
    try {
        const user = await User.login(username,password); //static method
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}); //maxAge in milliseconds here
        res.status(200).json( { user: user._id} )
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
    
});

router.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1} );
    res.redirect('/');
});

router.get('/users/:id', requireAuth, (req,res) => {
    res.render('userpage');
});

module.exports = router;

