'use-strict';

const express = require('express'),
    product = require('./product'),
    user = require('./user'),
    category = require('./category'),
    {validateUser} = require('../Helpers/middleware');

const Router = express.Router();

Router.get('/', (req, res) => {
    res.json({
        status:res.statusCode,
        result:{
        message: "Welcome to Point Of Sales RESTful API, You can read the documentation at README.md",
        author: "Chandu",
        email: "chandu.prince951@gmail.com",
        }
    });
})

Router.use('/product', validateUser, product);
Router.use('/user', user);
Router.use('/category', validateUser, category);



module.exports = Router;