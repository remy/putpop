const LRU = require('lru-cache');
const uuid = require('uuid').v4;
const MAX_AGE = 1000 * 60;
const cache = LRU({
  max: 500,
  maxAge: MAX_AGE, // 1 minute
});

function put({ body, headers }) {
  const id = uuid();
  cache.set(id, { body, mime: headers['content-type'] });
  return {
    id,
  };
}

function get(id) {
  const res = cache.get(id);
  if (res === undefined) {
    return new Error(404);
  }

  cache.del(id);
  return res;
}

const t = setInterval(() => cache.prune(), MAX_AGE);
t.unref(); // don't hold onto thread

module.exports = {
  put,
  get,
  stats: () => ({ count: cache.itemCount }),
  peek: id => cache.peek(id),
};
