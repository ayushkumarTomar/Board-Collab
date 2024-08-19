import { MetadataRoute } from "next";
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
    },
    sitemap: ["https://collabify-whiteboard.vercel.app/sitemap.xml"]
  };
}