const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
const mongoURI = "mongodb://localhost:27017/eNotebook";

const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("Successfully Connected");
    });
}

module.exports = connectToMongo;