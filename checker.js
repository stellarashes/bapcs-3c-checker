const RedditClient = require('./reddit-client');
const CamelClient = require('./camel-client');

module.exports = class Checker {
    static async run() {
        const submissions = await RedditClient.getNew();
        const amazonPosts = submissions.filter(p => CamelClient.isAmazonUrl(p.url));

        // TODO: skip ones already processed
        const toBePosted = amazonPosts;//.slice(0, 1);

        const commentsToBePosted = 
            (await Promise.all(toBePosted.map(post => CamelClient.getCamelInfo(post))))
            .filter(x => !!x);

        await Promise.all(commentsToBePosted.map(data => RedditClient.postComment(data)));

        // TODO: add posts to processed list
    }

}