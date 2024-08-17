/** @type {import('next').NextConfig} */
const nextConfig = {
  // // Golden API URL is something like this:
  // // https://nightly.link/jcbhmr/bikeshed/nightly/bikeshed-ape-*
  // // https://nightly.link/:user/:repo/:workflow/:pattern ?branch
  // async redirects() {
  //     return [
  //         {
  //             source: "/:user/:repo/:kind(blob|tree|raw|blame|commits)/:ref_name/.github/workflows/:filename",
  //             destination: "/:user/:repo/blob/:ref_name/.github/workflows/:filename"
  //         },
  //         {
  //             // https://github.com/jcbhmr/bikeshed/actions/runs/10346657797/job/28635565136
  //             source: "/:user/:repo/actions/runs/:run_id(\\d+)/job/:job_id(\\d+)",
  //             destination: "/:user/:repo/actions/runs/:run_id"
  //         }
  //     ]
  // }
};

export default nextConfig;
