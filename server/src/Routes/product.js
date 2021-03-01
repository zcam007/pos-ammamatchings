'use-strict';

const express = require('express'),
    controller = require('../Controllers/product');

const Router = express.Router();

Router.get('/all', controller.getProducts);
Router.get('/:prod_id', controller.getProductById);
Router.post('/add', controller.newProduct);
Router.put('/:prod_id', controller.updateProduct)
Router.delete('/:prod_id', controller.deleteProduct);

module.exports = Router;