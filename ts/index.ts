import * as express from 'express';
import * as StatsD from 'statsd-client';
import * as log4js from 'log4js';

import PocketService from './services/PocketService';

var logger = log4js.getLogger();

if (process.env.FLUENTD_HOST) {
  var tags: any = getMap(process.env.FLUENTD_TAGS);
  tags.function = 'pocket-rss';
  log4js.addAppender(require('fluent-logger').support.log4jsAppender('pocket-rss', {
    host: process.env.FLUENTD_HOST,
    timeout: 3.0,
    tags: tags
  }));
}

var sdc = new StatsD(<any> {
  host: process.env.STATSD_HOST || 'localhost',
  port: process.env.STATSD_PORT || 8125,
  prefix: 'pocketrss',
  tags: getMap(process.env.STATSD_TAGS)
});

var app = express();

app.use((<any> sdc).helpers.getExpressMiddleware());

var pocketService = new PocketService();

app.get('/explore/:category', (req, res) => {
  pocketService.getExplorePath(req.params.category).then(rss => {
    logger.info('Generated feed for ' + req.params.category);
    sdc.increment('rss.count');
    res.set('Content-Type', 'text/xml');
    res.send(rss);
  }).catch(e => {
    logger.error('Unable to generate RSS feed for ' + req.params.category, e);
    res.sendStatus(500);
  });
});

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

function getMap(string: string): { [s: string]: string; } {
  return (string ? string.split(',') : []).reduce((allTags, tag) => {
    var pair = tag.split(':');
    allTags[pair[0].trim()] = pair.length === 1 ? true : pair[1].trim();
    return allTags;
  }, {});
}
