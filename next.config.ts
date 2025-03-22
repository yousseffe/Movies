import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ["res.cloudinary.com"], // Allow Cloudinary images
    },
    // experimental: {
    //     serverComponents: false, // Try disabling if it's enabled
    // },
};

export default nextConfig;
