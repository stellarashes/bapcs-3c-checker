const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: null,
});

const Entries = sequelize.define('entry', {
    submissionId: {type: Sequelize.STRING, unique: true}
});

sequelize.sync();

module.exports = class Database {
    static async findNotProcessed(posts) {
        if (process.env.NODE_ENV === 'development') {
            return posts;
        }

        const postIds = posts.map(p => p.id);
        const entries = await Entries.findAll({
            where: {
                submissionId: {
                    $in: postIds
                }
            }
        });
        return posts.filter(p => !entries.some(e => e.submissionId === p.id));
    }

    static async addProcessed(post) {
        if (process.env.NODE_ENV === 'development') {
            console.log(`dev adds ${post.id}`);
            return;
        }
        const entry = {submissionId: post.id};
        await Entries.create(entry);
    }
}