const express = require('express');
const User = require('../models/Users');
const { body, validationResult } = require('express-validator');
const router =  express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findOne } = require('../models/Users');
const fetchUser = require('../middleware/fetchUser')
require('dotenv').config()

// Route 1: create a new user POST: "/api/auth/createUser" . no login required 
router.post('/createUser',
[body('name',"please enter name must be 3 char").isLength({ min: 3 }),
body('email',"Please enter valid email").isEmail(),
body('password',"pasword must be at least 6 char and max 16 char").isLength({ min: 6,max:16})]
,async(req,res)=>{
  // if any error send bad response 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });      
    }
    try {
      // check the email has allready exists 
      let user = await User.findOne({email:req.body.email})
      if(user){
        return res.status(400).json({error:"Sorry! This Email already exists."})
      }
      // hashing of password for security
      const salt = bcrypt.genSaltSync(10);
      var secPass = bcrypt.hashSync(req.body.password, salt);
      // create a new user 
      user = await User.create({
          name: req.body.name,
          password: secPass,
          email:req.body.email,
        });
        // .then(user => res.json(user)).catch(err=> {
        //   console.log(err);
        //   res.json({error:"Please enter valid entry",message:err.message})        
        // });
        const data ={
          user:{id:user.id}
        }
        const authToken = jwt.sign(data, `${process.env.REACT_APP_JWT_SECRET}`);
        res.json({authToken})
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occurred!")
    }
});
// Route 2: Authenticate a  user using  POST: "/api/auth/login" . no login required 
router.post('/login',
// express-validator
[
body('email',"Please enter valid email").isEmail(),
body('password',"Password can not be blank").exists()],
async(req,res)=>{
  // if any error send bad response 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });      
  }
  // destructuring of email and password 
  const {email,password} = req.body;
  try {
    // try to find allready exists email 
    let user = await User.findOne({email})
    if(!user){
      return res.status(400).json({error:"Please try to login using correct credentials"})
    }
    // compare the password using bcrypt 
    const passwordCompare = await bcrypt.compare(password,user.password);
    if(!passwordCompare){
      return res.status(400).json({error:"Please try to login using correct credentials"})
    }
    const data ={
      user:{id:user.id}
    }
    // send paylaod data or token 
    const authToken = jwt.sign(data, `${process.env.REACT_APP_JWT_SECRET}`);
    res.json({authToken})
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Some error occurred!")
  }
});

// Route 3: get loggedin user detail using  POST: "/api/auth/getuser" . no login required 
// use fetchUser middleware 
router.post('/getuser',fetchUser , async (req,res)=>{
  try {
    const userId  = req.user.id;
    let user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Some error occurred!");
  }
})
module.exports = router;