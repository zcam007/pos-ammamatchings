'use-strict';

const express = require('express'),
    controller = require('../Controllers/category');

const Router = express.Router();

Router.get('/all', controller.getCategories);
Router.get('/:category_id', controller.getCategoryById);
Router.post('/add', controller.newCategory);
Router.put('/:category_id', controller.updateCategory);
Router.delete('/:category_id', controller.deleteCategory);

module.exports = Router;