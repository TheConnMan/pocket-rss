import * as Request from 'request-promise';
import * as Cheerio from 'cheerio';
import * as RSS from 'rss';

var POCKET_URL: string = 'https://getpocket.com/explore/';

class PocketService {

  public async getExplorePath(category: string): Promise<string> {
    var html = await Request(POCKET_URL + category);
    var $ = Cheerio.load(html);
    var articles = $('.portal_list > li > article').toArray().map((element) => {
      var link = $(element).children('a');
      var content = $(element).children('div.item_content');
      return {
        id: link.attr('data-id'),
        url: link.attr('data-saveurl'),
        thumbnail: link.children('div').attr('data-thumburl'),
        domain: content.children('cite').children('a').text(),
        date: new Date(content.children('cite').children('.read_time').text()),
        title: content.children('.title').children('a').text(),
        excerpt: content.children('p').text()
      };
    });
    return this.formatRss(category, articles);
  }

  public formatRss(category: string, articles: Array<any>): any {
    var feed = new RSS(<any> {
      title: 'Pocket: ' + category.charAt(0).toUpperCase() + category.slice(1),
      site_url: POCKET_URL + category
    });
    articles.forEach(article => {
      feed.item(<any> {
        title: article.title,
        guid: article.id,
        url: article.url,
        description: article.excerpt,
        date: article.date
      })
    });
    return feed.xml();
  }
}

export default PocketService;
