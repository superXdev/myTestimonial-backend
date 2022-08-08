const fs = require('fs');
const axios = require('axios');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const config = require('../config/config.json');
const { Profile, Review, sequelize: db } = require("../models/index.js");
const { sendReview } = require('../bot.js');

Profile.hasOne(Review);
Review.belongsTo(Profile);

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
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw Error(JSON.stringify(errors.array()));
        }

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
        const isJson = (json) => {
            try {
                JSON.parse(json);
                return true;
            } catch {
                return false;
            }
        }

        res.status(400).send({
            status: 'failed',
            message: isJson(err.message) ? JSON.parse(err.message) : err.message
        });
    }
}

const uploadPhoto = async (req, res) => {
    try {
        if(req.file.mimetype !== 'image/jpeg' && req.file.mimetype !== 'image/png') {
            throw Error('File type are not allowed');
        }

        const sizeInMb = req.file.size / 1024 / 1024;
        if(sizeInMb > 1) {
            throw Error('Maximum image size is 1MB');
        }

        if(config.file.storage === 'local') {
            const fileName = crypto.createHash('md5').update(Date.now().toString()).digest('hex').substr(15)

            fs.writeFileSync(`${process.cwd()}/public/photo/${fileName}`, req.file.buffer, function (err) {
                if (err) throw Error('Cannot write file locally');
            });
            
            return res.send(config.base_url + `/photo/${fileName}`);
        }

        const base64Data = req.file.buffer.toString('base64');

        let formData = new URLSearchParams();
        formData.append('image', base64Data);

        const result = await axios({
            method: 'post',
            url: `https://api.imgbb.com/1/upload?key=${config.file.imgbb_key}`,
            data: formData,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        });

        res.send(result.data.data.thumb.url);
    } catch (err) {
        res.status(400).send({
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