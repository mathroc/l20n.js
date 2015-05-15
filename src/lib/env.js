'use strict';

/* jshint -W079 */

import View from './view';
import Resolver from './resolver';
import debug from './debug';

export default function Env(id, fetch) {
  this.id = id;
  this.fetch = fetch;

  this._resMap = Object.create(null);
  this._resCache = Object.create(null);
}

Env.prototype.createView = function(resIds) {
  var view = new View(this, resIds);

  resIds.forEach(function(res) {
    if (!this._resMap[res]) {
      this._resMap[res] = new Set();
    }
    this._resMap[res].add(view);
  }, this);

  return view;
};

Env.prototype.destroyView = function(view) {
  var cache = this._resCache;
  var map = this._resMap;

  view._resIds.forEach(function(resId) {
    if (map[resId].size === 1) {
      map[resId].clear();
      delete cache[resId];
    } else {
      map[resId].delete(view);
    }
  });
};

Env.prototype._getResource = function(lang, src, res) {
  debug('getting resource', res, 'for', lang);
  var cache = this._resCache;

  if (!cache[res]) {
    cache[res] = Object.create(null);
    cache[res][lang] = Object.create(null);
  } else if (!cache[res][lang]) {
    cache[res][lang] = Object.create(null);
  } else if (cache[res][lang][src]) {
    debug(res, 'for', lang, 'found in ' + src + ' cache; returning');
    return cache[res][lang][src];
  }

  return cache[res][lang][src] = this.fetch(src, res, lang).then(
    function(ast) {
    debug(res, 'for', lang, 'loaded');
    return cache[res][lang][src] = createEntries(lang, src, ast);
  }, function(err) {
    debug(res, 'for', lang, 'errored with', err);
    // XXX Emit the error but don't propagate it to Promise.all in
    // Context._fetchResources so that Context.ready always fullfills.
    return cache[res][lang][src] = err;
  });
};

function createEntries(lang, src, ast) {
  var entries = Object.create(null);
  for (var i = 0, node; node = ast[i]; i++) {
    entries[node.$i] = Resolver.createEntry(node, lang, src);
  }
  return entries;
}
