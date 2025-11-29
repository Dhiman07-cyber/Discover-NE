/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '127.0.0.1', 'www.adotrip.com', 'dm34pe2be5d8j.cloudfront.net', 'chalohoppo.com', 'images.travelandleisureasia.com', 'i0.wp.com', 'staticimg.amarujala.com', 'images.lifestyleasia.com', 'images.freekaamaal.com', 'i.pinimg.com', 'wallpapercrafter.com', 'travelistan.sk', 'travelsetu.com', 'j-archive.com', 'sneg.top', 'wallpaperaccess.com'],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    });

    return config;
  }
}

module.exports = nextConfig