import * as dotenv from 'dotenv';
dotenv.config();
import { Telegraf, Markup } from 'telegraf';
import localtunnel from 'localtunnel';

import Setting from "./models/Setting.js";
import Review from "./models/Review.js";

const tunnel = await localtunnel({ port: 5000 });

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const BASE_URL = process.env.APP_MODE === 'production' 
                    ? process.env.BASE_URL 
                    : tunnel.url;

if (TOKEN === undefined) {
  throw new Error('Bot token must be provided!')
}

if (TOKEN === ADMIN_USERNAME) {
  throw new Error('Admin username must be provided!')
}

export const bot = new Telegraf(TOKEN)
// Set the bot response
bot.start(async (ctx) => {
    if(ctx.message.from.username !== ADMIN_USERNAME) {
        return ctx.reply('Access forbidden');
    }

    const isExists = await Setting.findByPk(1);

    if(!isExists) {

        await Setting.create({
            adminUsername: ctx.message.from.username,
            chatId: ctx.message.chat.id
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

export const sendReview = async (id, fullName, position, message, rating) => {
    const setting = await Setting.findByPk(1);

    bot.telegram.sendMessage(setting.chatId, `<b>New Testimony</b>
====
From:
Name: ${fullName}
Position: ${position}
-----
"${message}"
${rating} ⭐`, {
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