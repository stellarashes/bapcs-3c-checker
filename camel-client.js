const URL = require('url');
const axios = require('axios');
const cheerio = require('cheerio');

const matchingHosts = [/\bamazon\.com$/i, /\ba\.co$/i]

module.exports = class CamelClient {
    static isAmazonUrl(url) {
        try {
            const parsed = URL.parse(url);
            return matchingHosts.some(match => parsed.hostname.match(match));
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
            const thirdPartySection = page('#section_new');

            const amazonPrice = this.getSectionPrice(amazonSection);
            const thirdPartyNewPrice = this.getSectionPrice(thirdPartySection);

            if (!amazonPrice.lowest && !thirdPartyNewPrice.lowest) {
                return null;
            }

            return {
                post,
                amazon: amazonPrice,
                thirdPartyNew: thirdPartyNewPrice,
                url: `https://camelcamelcamel.com${result.request.path}`,
            };
        } catch (e) {
            console.error(`Unable to parse ${url} due to ${e.message}`);
            console.error(e);
        }

        return null;
    }

    static getSectionPrice(section) {
        if (!section.length) {
            return null;
        }

        const highest = section.find('.highest_price'),
            lowest = section.find('.lowest_price');

        return {
            highest: this.getCellValue(highest),
            lowest: this.getCellValue(lowest),
        };
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