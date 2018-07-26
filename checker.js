const RedditClient = require('./reddit-client');
const CamelClient = require('./camel-client');
const Database = require('./database');
const delay = require('./delay');

module.exports = class Checker {
    static async run() {
        while (true) {
            try {
                const submissions = await RedditClient.getNew();
                const amazonPosts = submissions.filter(p => CamelClient.isAmazonUrl(p.url));

                const toBePosted = await Database.findNotProcessed(amazonPosts);

                const commentsToBePosted =
                    (await Promise.all(toBePosted.map(post => CamelClient.getCamelInfo(post))))
                        .filter(x => !!x);

                await Promise.all(commentsToBePosted.map(async data => {
                    await RedditClient.postComment(data);
                    await Database.addProcessed(data.post);
                }));
            } catch (e) {
                console.error(e);
            } finally {
                await delay(30000);
            }
        }
    }

}