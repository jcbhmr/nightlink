import { NextResponse, type NextRequest } from "next/server";
import { Octokit } from "octokit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ owner: string; repo: string; branch: string; workflowFileBasename: string; artifactName: string; }> }) {
    const { owner, repo, branch, workflowFileBasename, artifactName } = await params;
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const result = await octokit.rest.actions.listWorkflowRunsForRepo({
        owner,
        repo,
        branch,
    })
    const run_id = result.data.workflow_runs.filter(r => r.status === "completed")
    return NextResponse.json(result.data)
    const result2 = await octokit.rest.actions.listWorkflowRunArtifacts({
        owner,
        repo,
        run_id,
    })
    return NextResponse.redirect()
}