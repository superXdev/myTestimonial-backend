require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const localtunnel = require('localtunnel');
const TimeAgo = require('javascript-time-ago');
const en = require('javascript-time-ago/locale/en');

const { Setting, Profile, Review, sequelize: db } = require("./models/index.js");

Profile.hasOne(Review);
Review.belongsTo(Profile);

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;

if (TOKEN === undefined) {
  throw new Error('Bot token must be provided!')
}

if (TOKEN === ADMIN_USERNAME) {
  throw new Error('Admin username must be provided!')
}

const bot = new Telegraf(TOKEN);

// register admin when start bot
bot.start(async (ctx) => {
    try{
        if(ctx.message.from.username !== ADMIN_USERNAME) {
            return ctx.reply('Access forbidden');
        }

        const isExists = await Setting.findByPk(1);

        if(!isExists) {
            await Setting.create({
                adminUsername: ctx.message.from.username,
                chatId: ctx.message.chat.id,
                serverStarted: Date.now()
            });
        } else {
            await Setting.update({
                adminUsername: ctx.message.from.username,
                chatId: ctx.message.chat.id
            }, {
                where: { id: 1 }
            });
        }

        ctx.reply('Access granted!');
    } catch {
        ctx.reply('Something is wrong');
    }
    
});

// server information
bot.command('info', async (ctx) => {
    try {
        if(ctx.message.from.username !== ADMIN_USERNAME) {
            return ctx.reply('Access forbidden');
        }

        const acceptedReviews = await Review.count({
            where: { accepted: true }
        });
        const reviews = await Review.count();

        const sum = await Review.findAll({
            attributes: [
                [db.fn('sum', db.col('rating')), 'totalRating']
            ],
            where: { accepted: true }
        });

        TimeAgo.addLocale(en);
        const timeAgo = new TimeAgo('en-US');

        const setting = await Setting.findByPk(1);
        const avgRating = sum[0].dataValues.totalRating 
            ? sum[0].dataValues.totalRating / acceptedReviews : 0;
        const totalReviews = reviews;
        const uptime = timeAgo.format(new Date(parseInt(setting.serverStarted)))

    ctx.reply(`<b>Information</b>
====
Total reviews : ${totalReviews}
Accepted : ${acceptedReviews}
Avg. rating : ${avgRating.toFixed(2)}
---------
Uptime server : ${uptime}
        `, { parse_mode: 'HTML' });
    } catch {
        ctx.reply('Something is wrong');
    } 
});

const sendReview = async (id, fullName, position, message, rating) => {
    try {
        // function to get star as string
        const getStar = (total) => {
            let stars = ''
            for (var i = total; i > 0; i--) {
                stars = stars + '⭐'
            }

            for (var i = 5 - total; i > 0; i--) {
                stars = stars + '-'
            }

            return stars
        }

        const setting = await Setting.findByPk(1);

        bot.telegram.sendMessage(setting.chatId, `<b>New Testimony</b>
====
From:
Name: ${fullName}
Position: ${position}
--------------
Rating: ${getStar(rating)}

"${message}"
    `, {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
              Markup.button.callback('✅ Accept', `Accept-${id}`),
              Markup.button.callback('❌ Reject', `Reject-${id}`)
            ])
        });
    } catch(err) {
        console.log(err.message);
    }
}

bot.on('callback_query', async (ctx) => {
    try {
        let data = ctx.callbackQuery.data;
        data = data.split('-');

        if(data.includes('Reject')) {
            const review = await Review.findByPk(data[1]);
            await Review.destroy({
                where: { id: data[1] },
            });
            await Profile.destroy({
                where: { id: review.ProfileId }
            });

            ctx.reply(`[${data[1]}] Review rejected ❌`);

            return ctx.deleteMessage();
        }

        Review.update({ accepted: true }, {
            where: { id: data[1] }
        });

        ctx.reply(`[${data[1]}] Review accepted ✅`);
        ctx.deleteMessage();
    } catch {
        ctx.reply('Something is wrong');
    }
});

const BASE_URL = process.env.BASE_URL;
const secretPath = `/telegraf/${bot.secretPathComponent()}`;

bot.telegram.setWebhook(`${BASE_URL}${secretPath}`);


module.exports = {
    bot,
    secretPath,
    sendReview
}