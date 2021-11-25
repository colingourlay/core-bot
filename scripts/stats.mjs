#!/usr/bin/env node

import https from 'https';
import url from 'url';
import Chartscii from 'chartscii';
import yargs from 'yargs';

const { bot, article, debug, ratio } = yargs
  .option('bot', {
    alias: 'b',
    type: 'string',
    demand: true
  })
  .option('article', {
    alias: 'a',
    type: 'string'
  })
  .option('debug', {
    alias: 'd',
    type: 'boolean',
    default: false
  })
  .option('ratio', {
    alias: 'r',
    type: 'boolean',
    default: true
  }).argv;

const getData = async (name, clean) =>
  new Promise((resolve, reject) => {
    https
      .get(
        url.format({
          protocol: 'https',
          hostname: 'us-central1-poll-counters.cloudfunctions.net',
          pathname: '/get',
          query: {
            group: `core-bot${debug ? '_debug' : ''}__${name}`,
            question: `${bot}::${article || 'ANY'}`
          }
        }),
        res => {
          const { statusCode } = res;
          const contentType = res.headers['content-type'];

          let error;

          if (statusCode !== 200) {
            error = new Error('Request Failed.\n' + `Status Code: ${statusCode}`);
          } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
          }

          if (error) {
            console.error(error.message);
            res.resume();
          }

          res.setEncoding('utf8');

          let rawData = '';

          res.on('data', chunk => {
            rawData += chunk;
          });

          res.on('end', () => {
            try {
              const parsedData = JSON.parse(rawData);

              if (Array.isArray(parsedData.value)) {
                return resolve(
                  parsedData.value.reduce((obj, val, key) => {
                    if (typeof val === 'number') {
                      obj[key] = val;
                    }

                    return obj;
                  }, {})
                );
              }

              resolve(clean ? clean(parsedData.value) : parsedData.value);
            } catch (e) {
              reject(e.message);
            }
          });
        }
      )
      .on('error', e => {
        reject(`Got error: ${e.message}`);
      });
  });

const getTotal = async name => (await getData(name))['TOTAL'];

const getChartsciiData = (dict, formatKey = x => x) =>
  Object.keys(dict).map(key => ({ value: dict[key], label: formatKey(key) }));

const getChartciiChart = (dict, label, formatKey) =>
  new Chartscii(getChartsciiData(dict, formatKey), {
    label,
    theme: 'lush',
    width: 50,
    fill: '░',
    sort: false,
    reverse: true,
    percentage: ratio,
    color: 'pink'
  });

try {
  const [totalSessionStarts, sessionDuration, sessionPrompts, promptTarget, exitLink] = await Promise.all([
    getTotal('session-start'),
    getData('session-duration', sessionDuration => {
      const durations = Object.keys(sessionDuration);
      const cleanedSessionDuration = {};

      for (let i = 0, len = durations.length; i < len; i++) {
        const duration = +durations[i];
        const lastDuration = i > 0 ? +durations[i - 1] : null;

        if (lastDuration !== null && duration - lastDuration > 30) {
          break;
        }

        cleanedSessionDuration[duration] = sessionDuration[duration];
      }

      return cleanedSessionDuration;
    }),
    getData('session-prompts'),
    getData('prompt-target'),
    getData('exit-link')
  ]);

  if (totalSessionStarts) {
    console.log(
      `\nTotal bot ${bot} sessions started in ${article ? `article ${article}` : 'all articles'}: ${totalSessionStarts}`
    );
  }

  if (sessionDuration) {
    // Total sessions is each value added together
    const totalSessions = Object.values(sessionDuration).reduce((memo, value) => memo + value, 0);
    // Total session time is the sum of each time multiplied by the number of sessions with that time
    const totalTime = Object.entries(sessionDuration).reduce((memo, [key, value]) => memo + value * (2.5 + +key), 0);
    const averageTimeUsingBot = Math.round(totalTime / totalSessions);

    console.log(
      `\nAverage session duration of bot ${bot} in ${
        article ? `article ${article}` : 'all articles'
      }: ${averageTimeUsingBot}s`
    );

    console.log(
      getChartciiChart(
        sessionDuration,
        `\nSession durations of bot ${bot} in ${article ? `article ${article}` : 'all articles'}`,
        x => `${x}-${5 + +x}s`
      ).create()
    );
  }

  if (sessionPrompts) {
    console.log(
      getChartciiChart(
        sessionPrompts,
        `\nNumber of prompts tapped in bot ${bot} in ${article ? `article ${article}` : 'all articles'}`
      ).create()
    );
  }

  if (promptTarget) {
    console.log(
      getChartciiChart(
        promptTarget,
        `\nDistribution of prompt targets in bot ${bot} in ${article ? `article ${article}` : 'all articles'}`
      ).create()
    );
  }

  if (exitLink) {
    console.log(
      getChartciiChart(
        exitLink,
        `\nDistribution of exit links in bot ${bot} in ${article ? `article ${article}` : 'all articles'}`
      ).create()
    );
  }

  console.log('\nFull data:');
  console.log({
    bot,
    article,
    debug,
    totalSessionStarts,
    sessionDuration,
    sessionPrompts,
    promptTarget,
    exitLink
  });
} catch (e) {
  console.error(e);
}
