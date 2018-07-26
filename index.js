require('dotenv').config();
const Checker = require('./checker');

Checker.run().then(() => console.log("done"))
.catch(err => {
    console.error(err);
});