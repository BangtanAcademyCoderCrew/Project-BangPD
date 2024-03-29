const querystring = require('querystring');
const got = require('got');
const et = require('elementtree');
const Promise = require('promise');
const { krDictUrl, krDictToken } = require('../apiconfig.json');
const https = require('https');
const rootCas = require('ssl-root-cas').create();
const path = require('path');

module.exports = class ExampleSentenceAPI {
  constructor() {
    this.options = {
      key: krDictToken,
      type_search: 'search',
      part: 'exam',
      method: 'exact',
      multimedia: 0,
      sort: 'dict'
    };
  }

  searchExamples(q) {
    //Needed to fix UNABLE_TO_VERIFY_LEAF_SIGNATURE issue - https://stackoverflow.com/a/60020493
    let reqPath = path.join(__dirname, '../');
    rootCas.addFile(path.resolve(reqPath, 'krdic_api_cert.pem'));
    https.globalAgent.options.ca = rootCas;

    this.options.q = q;
    const url = `${krDictUrl}search?${querystring.stringify(this.options)}`;

    const options = {
      url,
      headers: {
        'content-type': 'application/xml',
        Accept: 'application/xml'
      }
    };


    const promise = new Promise((resolve, reject) =>(async () => {
      try {
        const response = await got(options);
        resolve(response.body);
        // => '<!doctype html> ...'
      } catch (error) {
        console.log(error);
        // => 'Internal server error ...'
      }
    })());
    return promise;
  }

  parseExampleResult(r) {
    this.exampleEntries = [];
    et.parse(r).findall('item').forEach((item) => {
      const entry = { word: item.find('word').text };
      entry.example = item.find('example').text.trim();
      this.exampleEntries.push(entry);
    });
    return this.exampleEntries;
  }
};
