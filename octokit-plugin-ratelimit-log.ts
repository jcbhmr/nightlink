import { Octokit } from "@octokit/core";
import { parseRateLimit } from 'ratelimit-header-parser'

export function ratelimitLog(octokit: Octokit) {
  octokit.hook.after("request", (response) => {
    const rateLimit = parseRateLimit(response.headers);
    if (rateLimit) {
      octokit.log.info(`Rate limit: ${rateLimit.remaining}/${rateLimit.limit}`);
    }
  });
}