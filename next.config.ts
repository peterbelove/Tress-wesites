import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // 301s for project pages whose private client names were made neutral.
    return [
      {
        source: "/projects/mr-olorunmola-residence",
        destination: "/projects/private-residence-ondo",
        permanent: true,
      },
      {
        source: "/projects/mr-festus-residence",
        destination: "/projects/private-residence-ife",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
