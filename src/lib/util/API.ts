import { asyncLock } from './asyncLock';
import unsentRequest from './unsentRequest';

import type { AsyncLock } from './asyncLock';

export interface FetchError extends Error {
  status: number;
}

interface API {
  rateLimiter?: AsyncLock;
  buildRequest: (req: ApiRequest) => ApiRequest | Promise<ApiRequest>;
  requestFunction?: (req: ApiRequest) => Promise<Response>;
}

export type ApiRequestObject = {
  url: string;
  params?: Record<string, string | boolean | number>;
  method?: 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'PATCH';
  headers?: Record<string, string>;
  body?: string | FormData;
  cache?: 'no-store';
};

export type ApiRequest = ApiRequestObject | string;

class RateLimitError extends Error {
  resetSeconds: number;

  constructor(message: string, resetSeconds: number) {
    super(message);
    if (resetSeconds < 0) {
      this.resetSeconds = 1;
    } else if (resetSeconds > 60 * 60) {
      this.resetSeconds = 60 * 60;
    } else {
      this.resetSeconds = resetSeconds;
    }
  }
}

export async function requestWithBackoff(
  api: API,
  req: ApiRequest,
  attempt = 1,
): Promise<Response> {
  if (api.rateLimiter) {
    await api.rateLimiter.acquire();
  }

  try {
    const builtRequest = await api.buildRequest(req);
    const requestFunction = api.requestFunction || unsentRequest.performRequest;
    const response: Response = await requestFunction(builtRequest);
    if (response.status === 429) {
      // GitLab/Bitbucket too many requests
      const text = await response.text().catch(() => 'Too many requests');
      throw new Error(text);
    } else if (response.status === 403) {
      // GitHub too many requests
      const json = await response.json().catch(() => ({ message: '' }));
      if (json.message.match('API rate limit exceeded')) {
        const now = new Date();
        const nextWindowInSeconds = response.headers.has('X-RateLimit-Reset')
          ? parseInt(response.headers.get('X-RateLimit-Reset')!)
          : now.getTime() / 1000 + 60;

        throw new RateLimitError(json.message, nextWindowInSeconds);
      }
      response.json = () => Promise.resolve(json);
    }
    return response;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    if (attempt > 5 || err.message === "Can't refresh access token when using implicit auth") {
      throw err;
    } else {
      if (!api.rateLimiter) {
        const timeout = err.resetSeconds || attempt * attempt;
        console.log(
          `Pausing requests for ${timeout} ${
            attempt === 1 ? 'second' : 'seconds'
          } due to fetch failures:`,
          err.message,
        );
        api.rateLimiter = asyncLock();
        api.rateLimiter.acquire();
        setTimeout(() => {
          api.rateLimiter?.release();
          api.rateLimiter = undefined;
          console.log(`Done pausing requests`);
        }, 1000 * timeout);
      }
      return requestWithBackoff(api, req, attempt + 1);
    }
  }
}

export async function readFile(
  id: string | null | undefined,
  fetchContent: () => Promise<string | Blob>,
  localForage: LocalForage,
  isText: boolean,
) {
  const key = id ? (isText ? `gh.${id}` : `gh.${id}.blob`) : null;
  const cached = key ? await localForage.getItem<string | Blob>(key) : null;
  if (cached) {
    return cached;
  }

  const content = await fetchContent();
  if (key) {
    await localForage.setItem(key, content);
  }
  return content;
}

export type FileMetadata = {
  author: string;
  updatedOn: string;
};

function getFileMetadataKey(id: string) {
  return `gh.${id}.meta`;
}

export async function readFileMetadata(
  id: string | null | undefined,
  fetchMetadata: () => Promise<FileMetadata>,
  localForage: LocalForage,
) {
  const key = id ? getFileMetadataKey(id) : null;
  const cached = key && (await localForage.getItem<FileMetadata>(key));
  if (cached) {
    return cached;
  }

  const metadata = await fetchMetadata();
  if (key) {
    await localForage.setItem<FileMetadata>(key, metadata);
  }
  return metadata;
}
