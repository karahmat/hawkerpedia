# Hawkerpedia with JS / NodeJS

If you are only interested to run the application, you can go to [Hawkerpedia](https://hawkerpedia.herokuapp.com).

## Introduction
This website seeks to be the first-ever repository of hawker stalls in Singapore with data populated by food lovers themselves.

Govtech and NEA only offer data containing a [list of hawker centres](https://data.gov.sg/dataset/list-of-government-markets-hawker-centres) in Singapore and their addresses, and a [list of Licensed Eating Establishments](https://data.gov.sg/dataset/list-of-nea-licensed-eating-establishments-with-grades-demerit-points-and-suspension-history) with Grades, Demerit Points and Suspension History.

With this repository, any food lover can help fill in information on what each hawker stall sells! 

## Structure of Application
The whole web application is programmed with HTML, CSS and VanillaJS for the front-end, and NodeJS for the back-end. The database used is Mongoose / MongoDB. 

The backend follows the conventional Model-View-Controller structure. 

JWT was used for authentication. 

## User access
There are three levels of user access:

1. *Guests* - can only view the list of hawker centres and hawker stalls

2. *Bureaucrats* - can only edit the details of each hawker *stall* but not the hawker centre. Bureaucrats cannot add or delete a hawker stall and hawker centre. To become a Bureaucrat, one needs the User ID of an existing Bureaucrat or Administrator. The username of the last Bureaucrat to edit a page will be shown to all readers to ensure that the Bureaucrat fills in the data responsibly. 

3. *Administrators* - can edit the details of the hawker stall and hawker centre, including adding and deleting new ones. An Administrator can also downgrade or upgrade a user's access level

## Seeding of Data
I first had to 'fetch' data from Govtech's [list of hawker centres](https://data.gov.sg/dataset/list-of-government-markets-hawker-centres) and NEA's [list of Licensed Eating Establishments](https://data.gov.sg/dataset/list-of-nea-licensed-eating-establishments-with-grades-demerit-points-and-suspension-history). 

To get the coordinates (longitude and latitude) of each hawker centre, I used OneMap's API. Documentation on OneMap's API can be found [here](https://www.onemap.gov.sg/docs/).

The advantage of OneMap over GoogleMaps is that OneMap's API is free, as long as we do not exceed 240 calls per minute. I used the Bottleneck library to ensure that I do not exceed this rate-limiting factor. 

After getting the coordinates, I include this data into my Hawker Centre document in the Hawker Centres collection. 

There was also some 'cleaning' up of data to be done, as some of the names of the Hawker Centres in the Hawker Centre collection do not match that in the Hawker Stalls collection. This was because Govtech did not standardise the names, such that terms like "LORONG/LOR" and "STREET/ST" are spelt differently in each of the collections.

## User Authentication

JSON Web Token (JWT) was used for user authentication. I installed the jsonwebtoken library and the cookieparser library to make it easier for me to deal with cookies. I chose JWT, instead of sessions, as I did not want the server's memory to be burdened with users' data. (What if there are 1000000 users logging in to my website simultaneously.) 

This is how JWT works:

### Overview

![JWT description](https://github.com/karahmat/hawkerpedia/blob/main/readmeImages/JWTflow.png) 

1. A user logs in via a web form from the website which sends a request to the server with the user's credentials, i.e., a username and a password.

2. The server then checks those credentials against those stored in a database for that user.

3. If the credentials are correct, the server then creates a JSON Web Token (JWT) for the user and it sends it to the browser where it can be stored in a cookie.

### How is the JWT used?

![JWT description](https://github.com/karahmat/hawkerpedia/blob/main/readmeImages/JWTstring.png) 

1. JWT contains encoded data about that user to identify him/her. It is stored in a cookie in the user’s browser. The encoded data comprises three parts:

    - Header: is needed because they tell the server what type of signature is being used. It contains metadata about the token.
    - Payload: is needed because when it's decoded, it will help us identify the user on the server. It will contain something like the user id (as in my case).
    - Signature: makes the JWT secure and it ensures that tokens are not tampered with on the client. It's a stamp of authenticity from the server.

2. Cookies are sent to the server by the browser for every request the users make, e.g., whenever they visit a new page.

3. When the server gets that token in the cookie, it can decode it to identify the user (through the user’s ID, for example).

4. If the token is verified to belong to a valid user, the user can then decide to show the user protected data or pages which require the user to be authenticated.   

### Codes for User authentication

The authentication middleware:

```javascript
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user'); //my User model

//authentication middleware
const requireAuth = (req, res, next) => {

    const token = req.cookies.jwt;
  
    //check json web token exists and is valid
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          console.log(err.message);
          res.redirect('/login');
        } else {          
          next();
        }
      })

    } else { //there is no token
      res.redirect("/login");
    }
}
```
The above function is then "attached" as a middleware to any routes that needs protection from unauthorised user.

The middleware to check whether a user is logged in:

```javascript

//check current user middleware
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
            if (err) {
              console.log(err.message);
              res.locals.user = null; //if user does not exist, then user property is null
              next();
            } else {
              console.log(decodedToken);
              let user = await User.findById(decodedToken.id);
              res.locals.user = user;
              next();
            }
          });
    } else {
        res.locals.user = null; //if user does not exist, then user property is null
        next();
    }
}

```
On my server.js page, I then "expose" this function to all my routes:
```javascript
app.get('*', checkUser);
```

## Form validation during registration and login

Form validation was done *both* at the frontend and backend

### Frontend form validation

Frontend validation was very easily done, as it was just a matter of adding the attributes "required" or "minlength" (for passwords) or type="email" to the <input> tag. If these conditions are not met, the browser will not allow the form-data to be sent. 

However, frontend form validation has some limitations. It will not be able to handle "unique" username. I also needed to check whether the referrer ID exists. This is where the backend form validation and error handling come in handy. 

### Backend form validation

There are two parts to this: (1) setting the User Schema to ensure that any required fields trigger off a customised error message (of my liking), if those fields are not filled; and (2) defining the error handling function

1. Setting the Schema: The User schema can be defined as follows:

```javascript
const userSchema = new Schema({
    username: {
        type: String, 
        required: [true, 'Please enter an email'], //if username is not given, an error message "Please enter an email" should be sent
        unique: true, //if the username is not unique, an error code 11000 will be sent out
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
```

2. A function to handle the error messages can be "captured" in the try/catch(err) block. But we need to "dissect" the error messages, in case there are multiple error messages at one time. For that, I had to define an error handler function:

```javascript
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
            access = ""; //since access is a required field, if it is a blank string, Mongoose will sent off an error message (pls see my User schema above)
        }
                
        return access;
    } 
    catch (err) {
        console.log(err);
    }
}
```

The above error messages can be sent back to the browser, and the browser can read those error messages and show it on the dom. At the backend, I used the following lines of code in the POST /register and /login route:

```javascript
    catch (err) {                    
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
```

At the frontend, I used the following lines of code in the <script> tag:

```javascript
try {
        const res = await fetch('/register', {
            method: 'POST',
            body: JSON.stringify({username, password, code}),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await res.json();
        // if there are errors, please show it on my DOM. usernameError, passwordError etc are <div> tags. 
        if (data.errors) {
            usernameError.textContent = data.errors.username;
            passwordError.textContent = data.errors.password;
            codeError.textContent = data.errors.code;
            accessError.textContent = data.errors.access;
        }
        if (data.user) {
            location.assign('/'); //redirect to homepage
        }
    }
    catch (err) {
        console.log(err);
    }

})
```

## Using Imgur as a third-party image storage service

My Hawker Edit form allows users to upload images. However, these images will not be stored in my server, as this will only burden my server. So, I used a third-party image storing service called Imgur. 

Imgur requires you to upload your photo on your local server first. Thereafter, upload the photo from the local server to Imgur. Lastly, I used the fileserver (fs) core library to delete my photo.

The detailed steps are as follows:

1. Install the libraries multer and imgur. (npm install multer imgur)

2. Import the dependencies:
```javascript
const multer = require('multer');
const imgur = require('imgur');
const fs = require('fs'); //this is a core library, so you do not have to install it
```

3. Configure your multer at your backend:
```javascript
const diskStorage = multer.diskStorage({
    destination: "./uploads", //the directory where my photos will be stored TEMPORARILY
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  })

// after you setup multer to choose your disk storage, you can initialize a middleware to use for your routes
const uploadMiddleware = multer({ storage: diskStorage });
router3.use(uploadMiddleware.any());
```

4. At the frontend, I ensured that my "form" tag contains the following attribute  -- enctype="multipart/form-data" -- to deal with files

5. In my PUT hawkercentre edit route, upload the image to Imgur, and delete it from my local server:

```javascript
// Change this cliend id to your IMGUR own.
const clientId = process.env.IMGUR_ID;

// Setting
imgur.setClientId(clientId);

try {
    if (req.files[0]) {
        const file = req.files[0];
        const urlImage = await imgur.uploadFile(`./uploads/${file.filename}`); //upload to Imgur
        fs.unlinkSync(`./uploads/${file.filename}`); //delete the file
        
        tempObj.img = urlImage.link;
    }
    
    await HawkerStall.updateOne({_id: req.params.id}, tempObj);
    await User.updateOne({_id: req.body.userId}, {$push: { editedPosts: editedPost }} );
    res.redirect(`/hawkercentre/${req.params.id}`);

} catch(err) {
    console.log(err);

}

```
