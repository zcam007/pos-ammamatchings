'use-strict';

const express = require('express'),
    controller = require('../Controllers/user'),
    {validateUser} = require('../Helpers/middleware');

const Router = express();

Router.get('/logout',validateUser, controller.logoutUser);
Router.get('/all',validateUser, controller.getUserList);
Router.post('/register', controller.registerUser);
Router.post('/login', controller.loginUser);
Router.get('/:user_id', validateUser, controller.getUserById);
Router.put('/:user_id', validateUser, controller.updateUser);
Router.delete('/:user_id', validateUser, controller.deleteUser);


module.exports = Router;