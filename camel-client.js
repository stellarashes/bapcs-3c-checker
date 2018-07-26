const URL = require('url');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = class CamelClient {
    static isAmazonUrl(url) {
        try {
            const parsed = URL.parse(url);
            return parsed.hostname.match(/\bamazon\.com$/i);
        } catch (e) {
            return false;
        }
    }

    static async getCamelInfo(post) {
        const url = post.url;
        const result = await axios.get(`https://camelcamelcamel.com/search?sq=${encodeURIComponent(url)}`);
        if (result.status !== 200) {
            return null;
        }

        try {
            const page = cheerio.load(result.data);
            const amazonSection = page('#section_amazon');
            if (!amazonSection.length) {
                return null;
            }

            const highest = amazonSection.find('.highest_price'),
                lowest = amazonSection.find('.lowest_price');

            return {
                post,
                highest: this.getCellValue(highest),
                lowest: this.getCellValue(lowest),
                url: `https://camelcamelcamel.com${result.request.path}`,
            };
        } catch (e) {
            console.error(`Unable to parse ${url} due to ${e.message}`);
            console.error(e);
        }

        return null;
    }

    static getCellValue(parentCell) {
        if (!parentCell.length) {
            return null;
        }
        const cells = parentCell.find('td');
        return {
            price: cells.eq(1).text(),
            date: cells.eq(2).text(),
        };
    }
}