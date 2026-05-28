import type { StrapiHomeData, StrapiHistoryData, StrapiMedia, StrapiServiceData } from '../types/strapi';

const resolveMediaUrl = (media: StrapiMedia, baseUrl: string): StrapiMedia => ({
  ...media,
  url: media.url.startsWith('http') ? media.url : `${baseUrl}${media.url}`,
});

export const mapStrapiHome = (raw: StrapiHomeData, baseUrl: string): StrapiHomeData => ({
  ...raw,
  image1: raw.image1 ? resolveMediaUrl(raw.image1, baseUrl) : raw.image1,
  image2: raw.image2 ? resolveMediaUrl(raw.image2, baseUrl) : raw.image2,
});

export const mapStrapiHistory = (raw: StrapiHistoryData, baseUrl: string): StrapiHistoryData => ({
  ...raw,
  image: raw.image ? resolveMediaUrl(raw.image, baseUrl) : raw.image,
});

export const mapStrapiService = (raw: StrapiServiceData, baseUrl: string): StrapiServiceData => ({
  ...raw,
  services: raw.services.map((item) => ({
    ...item,
    image: item.image ? resolveMediaUrl(item.image, baseUrl) : null,
  })),
});
