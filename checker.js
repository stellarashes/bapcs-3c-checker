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
                
                const notRechecking = toBePosted.filter(post => !commentsToBePosted.some(x => post.id === x.id));
                const promiseAddNotChecking = Promise.all(notRechecking.map(post => Database.addProcessed(post)));

                const promisePosts = Promise.all(commentsToBePosted.map(async data => {
                    await RedditClient.postComment(data);

                    await Database.addProcessed(data.post);
                }));

                await promiseAddNotChecking;
                await promisePosts;
            } catch (e) {
                console.error(e);
                await delay(60000);
            } finally {
                await delay(30000);
            }
        }
    }

}