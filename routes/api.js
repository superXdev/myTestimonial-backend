import express from "express";
import multer from 'multer'
// Import Review Controller
import { 
    getReviews,
    createReview,
    uploadPhoto
 } from "../controllers/review.controller.js";
 
 // Init express router
const router = express.Router();
 
// Route get all Reviews
router.get('/reviews', getReviews);
// Route create a new Review
router.post('/reviews', createReview);
router.post('/upload', multer().single('photo'), uploadPhoto);
 
// export router
export default router;
