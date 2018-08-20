const snoowraps = require('snoowrap');

const r = new snoowraps({
    userAgent: 'bapcs-3c-checker',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.CLIENT_TOKEN,
});
r.config({
    requestDelay: 5000
});

const subreddit = 'buildapcsales';

module.exports = class RedditClient {
    static async getNew() {
        return r.getSubreddit(subreddit).getNew({
            limit: 10
        });
    }

    static async postComment(camelInfoWithPost) {
        const commentContent = this.format(camelInfoWithPost);
        await camelInfoWithPost.post.reply(commentContent);
        console.log(`Posted reply to ${camelInfoWithPost.post.title} (${camelInfoWithPost.post.id})`);
    }

    static format(camelInfo) {
        return `Type|Amazon|3rd Party New
:---|:---|:---
Lowest|${this.formatPrice(camelInfo.amazon.lowest)}|${this.formatPrice(camelInfo.thirdPartyNew.lowest)}
Highest|${this.formatPrice(camelInfo.amazon.highest)}|${this.formatPrice(camelInfo.thirdPartyNew.highest)}

[3C link](${camelInfo.url})

*****
I am a bot; please send comments/questions to github issues

[github](https://github.com/stellarashes/bapcs-3c-checker)`
    }

    static formatPrice(priceInfo) {
        if (priceInfo) {
            return `${priceInfo.price} on ${priceInfo.date}`;
        }

        return 'N/A';
    }
}