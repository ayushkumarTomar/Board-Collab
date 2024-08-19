import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://collabify-whiteboard.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 1,
    },
    {
      url: 'https://collabify-whiteboard.vercel.app/board',
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.9,
    }
  ]
}