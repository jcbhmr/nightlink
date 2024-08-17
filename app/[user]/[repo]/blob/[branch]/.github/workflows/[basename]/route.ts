import { NextResponse, NextRequest } from "next/server";
import { redirect } from 'next/navigation';
import { Octokit } from "octokit"

export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  })
}

export async function GET(request: NextRequest, { params }: { params: {} }) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  octokit.rest.

  return Response.json(params, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  })
}