const express = require("express");
const multer = require('multer');
const { 
    getReviews,
    createReview,
    uploadPhoto
 } = require("../controllers/review.controller.js");
 
 // Init express router
const router = express.Router();
 
// Route get all Reviews
router.get('/reviews', getReviews);
// Route create a new Review
router.post('/reviews', createReview);
router.post('/upload', multer().single('photo'), uploadPhoto);
 
// export router
module.exports = router;
