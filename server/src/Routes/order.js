'use-strict';

const express = require('express'),
    controller = require('../Controllers/order');

const Router = express.Router();

Router.get('/all', controller.getOrders);
Router.get('/:order_id', controller.getDetailOrderById);
Router.post('/add', controller.newOrder);
Router.put('/:order_id', controller.updateStatusOrder);

module.exports = Router;