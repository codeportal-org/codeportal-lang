import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://codeportal.io",
      lastModified: new Date(),
    },
  ]
}
