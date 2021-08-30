require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

//function to handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { username: '', password: '' };

    //incorrect username
    if (err.message === "incorrect username") {
        errors.username = "That username is not registered";
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

const maxAge = 3 * 24 * 60 * 60; //in seconds
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: maxAge,
    });
};



router.get('/register', async (req,res) => {
    res.render('registerPage');
});

router.post('/register', async (req,res) => {
    const { username, password, code } = req.body;
        
    let access = "";
    
    if (code === "vossstr17") {
        access = "administrator";
    } else {
        access = "bureaucrat";
    }

    try {
        const user = await User.create({username, password, code, access});
        const token = createToken(user._id);
        //send cookie to browser, but it cannot be accessed by clicking document.cookie
        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge * 1000}); //maxAge in milliseconds here
        res.status(201).json( { user: user._id });
    }
    catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
    
});

router.get('/login', async (req,res) => {
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


module.exports = router;

