import curry from 'lodash/curry';
import flow from 'lodash/flow';
import isString from 'lodash/isString';
import { getIn, mergeDeep, setIn } from './objectUtil';

function isAbortControllerSupported() {
  if (typeof window !== 'undefined') {
    return !!window.AbortController;
  }
  return false;
}

const timeout = 60;

function fetchWithTimeout(input, init) {
  if ((init && init.signal) || !isAbortControllerSupported()) {
    return fetch(input, init);
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout * 1000);
  return fetch(input, { ...init, signal: controller.signal })
    .then(res => {
      clearTimeout(timeoutId);
      return res;
    })
    .catch(e => {
      if (e.name === 'AbortError' || e.name === 'DOMException') {
        throw new Error(`Request timed out after ${timeout} seconds`);
      }
      throw e;
    });
}

function decodeParams(paramsString) {
  return paramsString.split('&').map(s => s.split('=').map(decodeURIComponent));
}

function fromURL(wholeURL) {
  const [url, allParamsString] = wholeURL.split('?');
  return { url, ...(allParamsString ? { params: decodeParams(allParamsString) } : {}) };
}

function fromFetchArguments(wholeURL, options) {
  const newOptions = { ...(options ?? {}) };
  delete newOptions.url;
  delete newOptions.params;

  return { ...fromURL(wholeURL), ...newOptions };
}

function encodeParams(params) {
  return Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

function toURL(req) {
  return `${req.url}${req.params ? `?${encodeParams(req.params)}` : ''}`;
}

function toFetchArguments(req) {
  const options = { ...(req ?? {}) };
  delete options.url;
  delete options.params;

  return [toURL(req), options];
}

function maybeRequestArg(req) {
  if (isString(req)) {
    return fromURL(req);
  }
  if (req) {
    return req;
  }
  return {};
}

function ensureRequestArg(func) {
  return req => func(maybeRequestArg(req));
}

function ensureRequestArg2(func) {
  return (arg, req) => func(arg, maybeRequestArg(req));
}

// This actually performs the built request object
const performRequest = ensureRequestArg(req => {
  const args = toFetchArguments(req);
  return fetchWithTimeout(args[0], args[1]);
});

// Each of the following functions takes options and returns another
// function that performs the requested action on a request.
const getCurriedRequestProcessor = flow([ensureRequestArg2, curry]);

function getPropSetFunction(path) {
  return getCurriedRequestProcessor((val, req) => {
    const newReq = { ...req };
    newReq[path] = val;
    return newReq;
  });
}

function getPropMergeFunction(path) {
  return getCurriedRequestProcessor((obj, req) => {
    const target = getIn(req, path);
    return setIn(req, path, mergeDeep(target, obj));
  });
}

const withMethod = getPropSetFunction(['method']);
const withBody = getPropSetFunction(['body']);
const withNoCache = getPropSetFunction(['cache'])('no-cache');
const withParams = getPropMergeFunction(['params']);
const withHeaders = getPropMergeFunction(['headers']);

// withRoot sets a root URL, unless the URL is already absolute
const absolutePath = new RegExp('^(?:[a-z]+:)?//', 'i');
const withRoot = getCurriedRequestProcessor((root, req) =>
  req.update('url', p => {
    if (absolutePath.test(p)) {
      return p;
    }
    return root && p && p[0] !== '/' && root[root.length - 1] !== '/'
      ? `${root}/${p}`
      : `${root}${p}`;
  }),
);

export default {
  toURL,
  fromURL,
  fromFetchArguments,
  performRequest,
  withMethod,
  withBody,
  withHeaders,
  withParams,
  withRoot,
  withNoCache,
  fetchWithTimeout,
};
