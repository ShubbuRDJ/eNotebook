const connectTOMongo = require('./mongoDB');
const express = require('express')
const cors = require('cors');
const path = require('path');
require('dotenv').config()

const port = process.env.PORT || 5000;

connectTOMongo();

const app = express()
app.use(express.json());
app.use(cors());

app.use('/api/auth',require('./routes/auth'));
app.use('/api/notes',require('./routes/notes'));

app.use(express.static(path.join(__dirname, './client/build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, './client/build/index.html'));
});



app.listen(port,()=>{
    console.log(`website is running on ${port} port`);
    
})
