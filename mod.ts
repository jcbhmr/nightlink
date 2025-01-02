import process from "node:process";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception"
import { z } from "zod";
import { Octokit } from "octokit"

const zGithubToken = z.string()
const zBaseURL = z.string().url()
const zOwner = z.string().regex(/^[a-zA-Z0-9-]+$/)
const zRepo = z.string().regex(/^[a-zA-Z0-9._-]+$/)
const zWorkflowId = z.string().endsWith(".yml").or(z.string().endsWith(".yaml"))
const zBranch = z.string().min(1)
const zName = z.string().min(1)

const auth = zGithubToken.parse(process.env.NIGHTLINK_GITHUB_TOKEN);
const baseUrl = zBaseURL.parse(process.env.NIGHTLINK_GITHUB_API_URL);
const octokit = new Octokit({ auth, baseUrl })
const cache = await caches.open("cache")

const app = new Hono()
app.get("/", async (c) => {
    return c.redirect("https://github.com/jcbhmr/nightlink#usage")
})
app.get("/:owner/:repo/:workflow_id/:branch/:name", async (c) => {
    const param = c.req.param();
    const owner = zOwner.parse(param.owner)
    const repo = zRepo.parse(param.repo)
    const workflow_id = zWorkflowId.parse(param.workflow_id)
    const branch = zBranch.parse(param.branch)
    const name = zName.parse(param.name)

    const canonicalRequest = new Request(new URL(`/${owner.toLowerCase()}/${repo.toLowerCase()}/${workflow_id}/${branch}/${name}`, c.req));
    const cachedResponse = await cache.match(canonicalRequest)
    if (cachedResponse) {
        return cachedResponse
    }

    const run_id = await (async () => {
        const response = await octokit.rest.actions.listWorkflowRuns({
            owner, repo, workflow_id, branch,
            status: "completed",
            per_page: 1,
            exclude_pull_requests: true,
        })
        const workflowRun = response.data.workflow_runs[0]
        if (!workflowRun) {
            throw new ReferenceError(".workflow_runs is empty")
        }
        return workflowRun.id
    })()

    const artifact_id = await (async () => {
        const response = await octokit.rest.actions.listWorkflowRunArtifacts({
            owner, repo, run_id,
            per_page: 1,
            name,
        })
        const artifact = response.data.artifacts[0]
        if (!artifact) {
            throw new ReferenceError(".artifacts is empty")
        }
        return artifact.id;
    })()

    const redirectURL = await (async () => {
        // octokit.rest.actions.downloadArtifact() follows redirects.
        const response = octokit.rest.actions.downloadArtifact({
        owner,
        repo,
        artifact_id,
        archive_format: "zip",
      });
      return response;
    })()

    const response = new Response(null, {
        status: 302,
        headers: {
            "Location": redirectURL
            "Cache-Control": `max-age=${5 * 60}`
        }
    })
    await cache.put(canonicalRequest, response.clone());
    return response;
})
app.onError((error, c) => {
    if (error instanceof HTTPException) {
        return error.getResponse()
    } else {
        return new HTTPException(500, { message: error.stack }).getResponse()
    }
})

Deno.serve(app.fetch);
