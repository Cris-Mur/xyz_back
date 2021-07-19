const express = require('express');
const router = express.Router();

const request = require('./request');
//console.log(request);

router.get(
    '/',
    request.getProducts
);

router.post(
    '/product',
    request.createProduct
);

router.patch(
    '/product/:id',
    request.updateProduct
);

router.delete(
    '/product/:id',
    request.deleteProduct
);

router.post(
    '/sell/:id',
    request.sellProduct
);

router.get(
    '/topBuyers',
    request.topBuyers
);

router.post(
    '/review',
    request.makeReview
);

router.get(
    '/revStats',
    request.revStats
);

router.get(
    '/revClients',
    request.revClients
);
module.exports = router;
