import { Client } from '@abcnews/poll-counters-client';
import { PARENT_ID, IS_DEBUG } from '../constants';

const clients = {};

export function track(botID, name, value) {
  clients[name] = clients[name] || new Client(`core-bot${IS_DEBUG ? '_debug' : ''}__${name}`);

  [`${botID}::ANY`, `${botID}::${PARENT_ID}`].forEach(question => {
    clients[name].increment({ question, answer: value == null ? 'TOTAL' : String(value) });
  });
}
