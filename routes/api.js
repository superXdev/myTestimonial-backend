const express = require("express");
const multer = require('multer');
const { body } = require('express-validator');

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
router.post(
    '/reviews',
    // name can not be empty
    body('fullName')
        .not().isEmpty().withMessage('Name can\'t be empty')
        .bail()
        .trim().escape(),
    // position can not be empty
    body('position').not()
        .isEmpty().withMessage('Position can\'t be empty')
        .bail()
        .trim().escape(),
    // review input
    body('reviews.comment')
        .not().isEmpty().withMessage('Comment can\'t be empty')
        .bail()
        .trim().escape(),
    body('reviews.rating')
        .not().isEmpty().withMessage('Rating can\'t be empty')
        .bail()
        .isInt({ min: 1, max: 5 }).withMessage('Only allowed between 1-5')
        .bail(),

    createReview
);
router.post('/upload', multer().single('photo'), uploadPhoto);
 
// export router
module.exports = router;
