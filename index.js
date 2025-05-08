
require('dotenv').config()
require('./app')

const express = require('express');
const app = express();
const bodyParser = require('body-parser'); 


const routes =  require('./routes')


app.use(express.json());
app.use(routes)
app.use(bodyParser.urlencoded({ extended: true }));


app.listen(3000, () => console.log('Server started at http://localhost:3000'));
