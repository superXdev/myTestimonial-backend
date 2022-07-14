import * as dotenv from 'dotenv';
dotenv.config();
import { Telegraf, Markup } from 'telegraf';
import localtunnel from 'localtunnel';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';

import Setting from "./models/Setting.js";
import Review from "./models/Review.js";
import db from "./config/database.js";

const tunnel = await localtunnel({ port: 5000 });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const BASE_URL = process.env.APP_MODE === 'production' 
                    ? process.env.BASE_URL 
                    : tunnel.url;

if (TOKEN === undefined) {
  throw new Error('Bot token must be provided!')
}

if (TOKEN === ADMIN_USERNAME) {
  throw new Error('Admin username must be provided!')
}

export const bot = new Telegraf(TOKEN);

// register admin when start bot
bot.start(async (ctx) => {
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
});

// server information
bot.command('info', async (ctx) => {
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
});

export const sendReview = async (id, fullName, position, message, rating) => {
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
}

bot.on('callback_query', (ctx) => {
    let data = ctx.callbackQuery.data;
    data = data.split('-');

    if(data.includes('Reject')) {
        ctx.reply(`[${data[1]}] Review rejected ❌`);
        return ctx.deleteMessage();
    }

    Review.update({ accepted: true }, {
        where: { id: data[1] }
    });

    ctx.reply(`[${data[1]}] Review accepted ✅`);
    ctx.deleteMessage();
});


export const secretPath = `/telegraf/${bot.secretPathComponent()}`;

bot.telegram.setWebhook(`${BASE_URL}${secretPath}`);