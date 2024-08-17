## Development

- [ ] `/{repo_owner}/{repo_name}/{_kind:blob|tree|raw|blame|commits}/{branch:.+}/.github/workflows/{workflow:[^/]+\\.ya?ml}`
- [ ] `/{repo_owner}/{repo_name}/actions/runs/{run_id:[0-9]+}`
- [ ] `/{repo_owner}/{repo_name}/runs/{job_id:[0-9]+}`
- [ ] `/{repo_owner}/{repo_name}/suites/{check_suite_id:[0-9]+}/artifacts/{artifact_id:[0-9]+}`
- [ ] `/{repo_owner}/{repo_name}/commit/{commit:[0-9a-fA-F]{40}}/checks/{job_id:[0-9]+}/logs`
- [ ] `/`
- [ ] `/dashboard`
- [ ] `/setup`
- [ ] `/{repo_owner}/{repo_name}/workflows/{workflow}/{branch}`
- [ ] `/{repo_owner}/{repo_name}/actions/runs/{run_id:[0-9]+}`
- [ ] `/{repo_owner}/{repo_name}/workflows/{workflow}/{branch}/{artifact}{zip:\\.zip}`
- [ ] `/{repo_owner}/{repo_name}/workflows/{workflow}/{branch}/{artifact}`
- [ ] `/{repo_owner}/{repo_name}/actions/runs/{run_id:[0-9]+}/{artifact}{zip:\\.zip}`
- [ ] `/{repo_owner}/{repo_name}/actions/runs/{run_id:[0-9]+}/{artifact}`
- [ ] `/{repo_owner}/{repo_name}/actions/artifacts/{artifact_id:[0-9]+}{zip:\\.zip}`
- [ ] `/{repo_owner}/{repo_name}/actions/artifacts/{artifact_id:[0-9]+}`
- [ ] `/{repo_owner}/{repo_name}/runs/{job_id:[0-9]+}{txt:\\.txt}`
- [ ] `/{repo_owner}/{repo_name}/runs/{job_id:[0-9]+}`

Relevant GitHub conventions for API URL design and appropriate redirects & aliasing:

- Page showing a specific workflow's runs: https://github.com/jcbhmr/bikeshed/actions/workflows/ci.yml
- Badge URL with custom branch and filtered event: https://github.com/jcbhmr/bikeshed/actions/workflows/ci.yml/badge.svg?branch=patch-1&event=push
- A particular workflow with summary & artifacts: https://github.com/jcbhmr/bikeshed/actions/runs/10346657797
- Download link for a specific artifact: https://github.com/jcbhmr/bikeshed/actions/runs/10346657797/artifacts/1800448916
- Specific job in a run (no artifacts): https://github.com/jcbhmr/bikeshed/actions/runs/10346657797/job/28635689146
- Download log archive of a workflow run: https://github.com/jcbhmr/bikeshed/suites/27058653543/logs?attempt=1
- View logs for a particular job: https://github.com/jcbhmr/bikeshed/commit/dea4e0b446d547c01d54a6c4b5db2dad6d547bf6/checks/28635689146/logs
- GitHub code view of workflow file: https://github.com/jcbhmr/bikeshed/blob/main/.github/workflows/ci.yml
- Download artifacts by name: `gh run download <run-id> --name <name1> --name <name2>`
- Download artifacts via glob: `gh run download <run-id> --pattern <pattern1> --pattern <pattern2>`
- Download specific release artifact: https://github.com/jcbhmr/bikeshed/releases/download/v4.1.12/bikeshed-ape-4.1.12.zip
- Download latest release artifact: https://github.com/jcbhmr/bikeshed/releases/latest/download/bikeshed-ape-4.1.12.zip
- Download file in Git tree: https://raw.githubusercontent.com/jcbhmr/bikeshed/v4.1.12/bikeshed-ape.cpp
- Filter workflows by attributes: https://github.com/jcbhmr/bikeshed/actions/workflows/ci.yml?query=actor%3Ajcbhmr

---

<h1>nightly.link <img src="logo.svg" alt="" height="24" style="height: 34px; vertical-align: sub"> for GitHub
<a href="https://github.com/oprypin/nightly.link"><img src="https://img.shields.io/github/stars/oprypin/nightly.link?style=social" alt="" style="float: right; height: 30px; margin-top: 10px"></a>
</h1>

This service lets you get a shareable link to download a [build artifact][] from the latest successful [GitHub Actions][] build of a repository.

Any public repository is accessible by default and **visitors don't need to log in**.

If you'll be publishing a link to your own repository's artifacts, please install [the GitHub App][app] anyway, so that downloads for your repositories don't share the global API rate limit. The throttling will likely become very bad over time.

[GitHub Actions]: https://docs.github.com/en/actions/guides/about-continuous-integration#about-continuous-integration-using-github-actions
[build artifact]: https://docs.github.com/en/actions/guides/storing-workflow-data-as-artifacts#uploading-build-and-test-artifacts
[app]: https://github.com/apps/nightly-link

<include controls>

## The issue

GitHub has no direct way to directly link to the _latest_ build from GitHub actions of a given repository.

Even if you _do_ have a link to an artifact, using it requires the visitor to be logged into the GitHub website.

The discussion originates at [actions/upload-artifact "Artifact download URL only work for registered users"](https://github.com/actions/upload-artifact/issues/51).

So, this service is a solution to this omission.

## Authorization

Because GitHub doesn't provide any permanent and public links to an artifact, this service redirects to time-limited links that GitHub can give to the application -- only on behalf of an authenticated user that has access to the repository. So, whenever someone downloads an artifact from a repository that you had added, this service uses a token that is associated with your installation of the GitHub App.

### [nightly.link][app] as an [Installed GitHub App][installations]

This GitHub App requests these permissions:

> - **Actions**: Workflows, workflow runs and artifacts.
>   - Access: **Read-only**
> - **Metadata** [mandatory]: Search repositories, list collaborators, and access repository metadata.
>   - Access: **Read-only**

[installations]: https://github.com/settings/installations

### [nightly.link][app] as an [Authorized GitHub App][authorizations]

Interestingly, the prompt that GitHub presents to you when authenticating to the service says something quite a bit scarier:

> **nightly.link by [Oleh Prypin](https://github.com/oprypin) would like permission to:**
>
> - Verify your GitHub identity (_$username_)
> - Know which resources you can access
> - Act on your behalf

In reality, this blurb is _completely generic_ and will be shown for any GitHub App authorization regardless of its permissions. [This is discussed here.](https://github.community/t/why-does-this-forum-need-permission-to-act-on-my-behalf/120453)

Furthermore, the permissions that the app asks for are granted even if it's just "installed", without being "authorized".

Verifying your identity is needed so that only you can view links to private repositories and your organizations. Other things, well, the service is not even asking for.

Feel free to [revoke][authorizations] this part (but keep the [install][installations]) when you're done with this website's UI.

[authorizations]: https://github.com/settings/apps/authorizations

## Privacy policy

An exhaustive list of what this service stores:

- Server-side:
  - Full repository names that you gave access to.
- Client-side: nothing.

The server of the main instance also keeps access logs and application logs for up to 3 months.

This page will be updated if this changes.

## Pricing

nightly.link is provided totally free of charge, including the main instance that has been running at the author's own expense.

If you rely on the service, **please support its continued maintenance by donating to the author**.

**[GitHub sponsors page of @oprypin](https://github.com/sponsors/oprypin)**

No paid features are currently planned.

## Author

This service is developed and run by [Oleh Prypin](http://pryp.in/).

It has no affiliation with my employer. No affiliation with GitHub either.

## Contact

Open an issue at <https://github.com/oprypin/nightly.link/issues>

## Source code

The source code is available in a Git repository at <https://github.com/oprypin/nightly.link>

### License

Copyright (C) 2020 Oleh Prypin

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
