const { getProducts } = require('./get');
const { createProduct, sellProduct } = require('./post');
const { updateProduct } = require('./patch');
const { deleteProduct } = require('./delete');
const { topBuyers } = require('./topBuyers');
const {makeReview} = require('./score');
const {revStats, revClients} = require('./statistics');
module.exports = {
    revStats,
    revClients,
    makeReview,
    topBuyers,
    sellProduct,
    deleteProduct,
    createProduct,
    updateProduct,
    getProducts
}
