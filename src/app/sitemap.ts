import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute['sitemap'] {
  return [
    {
      url: 'https://study.louis1618.shop/cottage',
      priority: 1,
    }
  ];
}