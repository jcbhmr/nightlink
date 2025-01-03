import process from "node:process";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import { Octokit } from "octokit";
import type { RequestError } from "@octokit/request-error";
import { zValidator } from "@hono/zod-validator";
import { throttling } from "@octokit/plugin-throttling";
import { cache } from "hono/cache";
import { showRoutes } from "hono/dev";
import { fromZodError } from 'zod-validation-error';
import { requestLog } from "@octokit/plugin-request-log";
import { ratelimitLog } from "./octokit-plugin-ratelimit-log.ts";

const envResult = z.object({
  NIGHTLINK_GITHUB_TOKEN: z.union([
    z.string().regex(/^ghp_[a-zA-Z0-9]{36}$/),
    z.string().regex(/^github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}$/),
  ]),
  NIGHTLINK_GITHUB_API_URL: z.optional(z.string().url()),
}).safeParse(process.env);
if (!envResult.success) {
  throw fromZodError(envResult.error);
}

if (envResult.data.NIGHTLINK_GITHUB_API_URL != null) {
  console.log("Using %s as GitHub API URL", envResult.data.NIGHTLINK_GITHUB_API_URL);
}

const MyOctokit = Octokit.plugin(throttling, requestLog, ratelimitLog);
const octokit = new MyOctokit({
  auth: envResult.data.NIGHTLINK_GITHUB_TOKEN,
  baseUrl: envResult.data.NIGHTLINK_GITHUB_API_URL,
  log: {
    debug: () => {},
    info: console.info,
    warn: console.warn,
    error: console.error,
  },
});

const app = new Hono();
app.use(logger());

app.get("/", (c) => {
  return c.redirect("https://github.com/jcbhmr/nightlink#usage");
});

app.get(
  "/:owner/:repo/:workflowId/:branch/:name",
  cache({
    cacheName: "nightlink",
    cacheControl: `max-age=${5 * 60}`,
    wait: true,
  }),
  zValidator(
    "param",
    z.object({
      owner: z.string().regex(/^[a-zA-Z0-9-]+$/),
      repo: z.string().regex(/^[a-zA-Z0-9._-]+$/),
      workflowId: z.string().regex(/\.ya?ml$/),
      branch: z.string().nonempty(),
      name: z.string().nonempty(),
    }),
    (result, c) => {
      if (!result.success) {
        return c.text(`URL params failed preliminary validation\n${c.req.routePath}: ${fromZodError(result.error)}`, 400);
      }
    }
  ),
  async (c) => {
    const { owner, repo, workflowId, branch, name } = c.req.valid("param");

    let runId: number;
    {
      const responseResult = await octokit.rest.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: workflowId,
        branch,
        status: "completed",
        per_page: 1,
        exclude_pull_requests: true,
      }).then(
        (r) => ({ success: true, data: r } as const),
        (e) => ({ success: false, error: e as RequestError } as const),
      );
      if (!responseResult.success) {
        if (responseResult.error.status === 404) {
          return c.text(`No workflow ${workflowId} found in ${owner}/${repo}\n${responseResult.error.status} ${responseResult.error.request.url}\n${responseResult.error.message}`, 404);
        } else {
          return c.text(`Error fetching list of workflow runs for ${workflowId} in ${owner}/${repo}\n${responseResult.error.status} ${responseResult.error.request.url}\n${responseResult.error.message}`, 500);
        }
      }

      const dataResult = z.object({
        workflow_runs: z.array(z.object({
          id: z.number(),
        })).nonempty(),
      }).safeParse(responseResult.data.data);
      if (!dataResult.success) {
        return c.text(`No workflow runs for ${workflowId} in ${owner}/${repo}\n${fromZodError(dataResult.error)}`, 404);
      }

      runId = dataResult.data.workflow_runs[0].id;
    }

    let artifactId: number;
    {
      const responseResult = await octokit.rest.actions
        .listWorkflowRunArtifacts({
          owner,
          repo,
          run_id: runId,
          per_page: 1,
          name,
        }).then(
          (r) => ({ success: true, data: r } as const),
          (e) => ({ success: false, error: e as RequestError } as const),
        );
      if (!responseResult.success) {
        if (responseResult.error.status === 404) {
          return c.text(`No such workflow run ${runId} for ${workflowId} in ${owner}/${repo}\n${responseResult.error.status} ${responseResult.error.request.url}\n${responseResult.error.message}`, 404);
        } else {
          return c.text(`Error fetching list of artifacts for run ${runId} of ${workflowId} in ${owner}/${repo}\n${responseResult.error.status} ${responseResult.error.request.url}\n${responseResult.error.message}`, 500);
        }
      }

      const dataResult = z.object({
        artifacts: z.array(z.object({
          id: z.number(),
        })).nonempty(),
      }).safeParse(responseResult.data.data);
      if (!dataResult.success) {
        return c.text(`No artifacts have the name ${name} on run ${runId} of ${workflowId} in ${owner}/${repo}\n${fromZodError(dataResult.error)}`, 404);
      }

      artifactId = dataResult.data.artifacts[0].id;
    }

    let redirectURL: string;
    {
      const responseResult = await octokit.rest.actions.downloadArtifact({
        owner,
        repo,
        artifact_id: artifactId,
        archive_format: "zip",
        request: {
          redirect: "manual",
        },
      }).then(
        (r) => ({ success: true, data: r } as const),
        (e) => ({ success: false, error: e as RequestError } as const),
      );
      if (!responseResult.success) {
        if (responseResult.error.status === 404) {
          return c.text(`No such artifact ${artifactId} for run ${runId} of ${workflowId} in ${owner}/${repo}\n${responseResult.error.status} ${responseResult.error.request.url}\n${responseResult.error.message}`, 404);
        } else {
          return c.text(`Error fetching download URL for ${name} on run ${runId} of ${workflowId} in ${owner}/${repo}\n${responseResult.error.status} ${responseResult.error.request.url}\n${responseResult.error.message}`, 500);
        }
      }

      const headersResult = z.object({
        location: z.string().url(),
      }).safeParse(responseResult.data.headers);
      if (!headersResult.success) {
        return c.text(`No location header in download redirect response for ${name} on run ${runId} of ${workflowId} in ${owner}/${repo}\n${fromZodError(headersResult.error)}`, 500);
      }

      redirectURL = headersResult.data.location;
    }

    return c.redirect(redirectURL);
  },
);

Deno.serve(app.fetch);

showRoutes(app, {
  verbose: true,
});
