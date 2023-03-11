const jwt = require('jsonwebtoken');
require('dotenv').config()


const fetchUser = (req,res,next)=>{
// get the user from jwt token and add id to req object 
    const token  = req.header('auth-token');
    if(!token){
        return res.status(401).send({error:"please authenticate using a valid token"});
    }
    try {
        const data = jwt.verify(token,process.env.REACT_APP_JWT_SECRET);
        req.user = data.user;
    } catch (error) {
        console.error(error.message);
        return res.status(401).send({error:"please authenticate using a valid token"});
    }
    next();
}

module.exports = fetchUser;