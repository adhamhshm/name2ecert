/** @type {import('next').NextConfig} */
// const nextConfig = {}

// module.exports = nextConfig

const nextConfig = {
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    },
};

module.exports = nextConfig;
