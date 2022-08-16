const express = require('express');
const router = express.Router();
const { renderHomepage, renderServicesPage } = require('../Controllers/home')

router
    .route('/')
    .get(renderHomepage);

router
    .route('/signup')
    .get(renderServicesPage)

module.exports = router;