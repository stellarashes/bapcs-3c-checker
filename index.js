require('dotenv').config();

const snoowraps = require('snoowrap');
const r = new snoowraps({
    userAgent: 'bapcs-3c-checker',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.CLIENT_TOKEN,
});

async function test() {
    const submissions = await r.getSubreddit(process.env.SUBREDDIT).getNew({
        limit: 10
    });
    console.log(submissions);
}

test().then(() => console.log("done"))
.catch(err => {
    console.error(err);
});