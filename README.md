# NightLink

🌙 Nightly links to GitHub Actions artifacts

<p align=center>TODO: image</p>

## Usage

**Examples:**

```
https://nightlink.jcbhmr.com/jcbhmr/nightlink/hello-world.yml/main/message.zip
```

### Self-hosting

You can self-host this project by deploying it to Deno Deploy or using the Deno
CLI on your own server.

```sh
export NIGHTLINK_GITHUB_TOKEN="github_pat_..."
deno run -A ./main.ts
```

You can also override the GitHub API base URL via an environment variable:

```sh
export NIGHTLINK_GITHUB_BASE_URL="https://api.github.example.com"
deno run -A ./main.ts
```

> [!TIP]
> Deno supports `--env-file ./.env` to load environment variables from a file.
>
> ```sh
> deno run -A --env-file ./.env ./main.ts
> ```

## Development

This project uses Deno Deploy because it is easy to use, supports TypeScript
natively, and is free. To develop this project locally, you'll need a GitHub
PAT (classic or fine-grained) with **no scopes**. This token will be used to
fetch the artifact metadata from public GitHub repositories.