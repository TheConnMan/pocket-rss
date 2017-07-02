import * as express from 'express';
import * as log4js from 'log4js';

var logger = log4js.getLogger();

if (process.env.FLUENTD_HOST) {
  var tags: any = (process.env.FLUENTD_TAGS ? process.env.FLUENTD_TAGS.split(',') : []).reduce((allTags, tag) => {
    var pair = tag.split(':');
    allTags[pair[0].trim()] = pair.length === 1 ? true : pair[1].trim();
    return allTags;
  }, {});
  tags.function = 'pocket-rss';
  log4js.addAppender(require('fluent-logger').support.log4jsAppender('pocket-rss', {
    host: process.env.FLUENTD_HOST,
    timeout: 3.0,
    tags: tags
  }));
}

var app = express();

app.get('/version', (req, res) => {
  res.send({
    name: 'pocket-rss',
    tagline: 'RSS feed for Pocket articles',
    version: process.env.npm_package_version
  });
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.listen(3000, () => {
  logger.info('Listening on 3000');
});
