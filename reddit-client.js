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
        // for now, only use a post on playground

        const commentContent = this.format(camelInfoWithPost);
        await r.getSubmission('91xdya')
            .reply(commentContent);
    }

    static format(camelInfo) {
        return `Type|Price|When
:---|:---|:---
Lowest|${this.formatPrice(camelInfo.lowest)}
Highest|${this.formatPrice(camelInfo.highest)}

[3C link](${camelInfo.url})

*****
I am a bot; please send comments/questions to github issues

[github](https://github.com/stellarashes/bapcs-3c-checker)`
    }

    static formatPrice(priceInfo) {
        if (priceInfo) {
            return `${priceInfo.price}|${priceInfo.date}`;
        }

        return 'Unknown|';
    }
}