require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');

const { Profile, Review, sequelize: db } = require("../models/index.js");
const { sendReview } = require('../bot.js');

Profile.hasOne(Review)
Review.belongsTo(Profile)

const getPagination = (page, size) => {
    const limit = size ? +size : 6;
    const offset = page ? page * limit : 0;
    return { limit, offset };
}
 
// Get all Profiles
const getReviews = async (req, res) => {
    try {
        const { limit, offset } = getPagination(req.query.page, req.query.size)
        const reviews = await Review.findAndCountAll({
            limit,
            offset,
            include: [{
                model: Profile,
                attributes: ['fullName', 'position', 'photo', 'linkedin', 'website']
            }],
            order: [
                ['createdAt', 'DESC']
            ],
            where: { accepted: true }
        });
        const sum = await Review.findAll({
            attributes: [
                [db.fn('sum', db.col('rating')), 'totalRating']
            ],
            where: { accepted: true }
        });

        const totalPages = Math.floor(reviews.count / limit);
        const currentPage = req.query.page ? +req.query.page : 0;
        const avgRating = sum[0].dataValues.totalRating / reviews.count;

        res.send({
            status: 'OK',
            totalReviews: reviews.count,
            avgRating: avgRating.toFixed(2),
            totalPages: totalPages,
            currentPage: currentPage,
            data: reviews.rows
        });
    } catch (err) {
        res.send({
            status: 'failed',
            message: err.message
        })
    }
}
 
// Create a new Profile
const createReview = async (req, res) => {
    try {
        const profile = await Profile.create({
            fullName: req.body.fullName,
            position: req.body.position,
            linkedin: req.body.linkedin,
            website: req.body.website,
            photo: req.body.photo
        });


        const review = await Review.create({
            comment: req.body.reviews.comment, 
            rating: req.body.reviews.rating, 
            ProfileId: profile.id
        });

        await sendReview(review.id, profile.fullName, profile.position, review.comment, review.rating);

        res.json({
            "status": "OK",
            "message": "Testimony successfully submitted & will be accepted soon"
        });
    } catch (err) {
        res.send({
            status: 'failed',
            message: err.message
        });
    }
}

const uploadPhoto = async (req, res) => {
    try {
        if(process.env.FILE_STORAGE === 'local') {
            const fileName = crypto.createHash('md5').update(Date.now().toString()).digest('hex').substr(15)
                + req.file.originalname 

            fs.writeFileSync(`${process.cwd()}/public/photo/${fileName}`, req.file.buffer, function (err) {
                if (err) throw Error('Cannot write file locally');
            });
            
            return res.send(process.env.BASE_URL + `/photo/${fileName}`);
        }

        const base64Data = req.file.buffer.toString('base64');

        let formData = new URLSearchParams();
        formData.append('image', base64Data);

        const result = await axios({
            method: 'post',
            url: `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            data: formData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        });

        res.send(result.data.data.thumb.url);
    } catch (err) {
        res.send({
            status: 'failed',
            message: err.message
        });
    }
    
}

module.exports = {
    getReviews,
    uploadPhoto,
    createReview
}