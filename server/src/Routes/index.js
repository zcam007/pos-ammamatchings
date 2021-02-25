'use-strict';

const express = require('express'),
    user = require('./user'),
    {validateUser} = require('../Helpers/middleware');

const Router = express.Router();

Router.get('/', (req, res) => {
    res.json({
        message: "Welcome to Point Of Sales RESTful API, You can read the documentation at README.md",
        author: "Chandu",
        email: "chandu.prince951@gmail.com"
    });
})


Router.use('/user', user);



module.exports = Router;