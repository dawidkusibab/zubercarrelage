export interface StrapiMediaFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  mime: string;
}

export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
  formats: Record<string, StrapiMediaFormat> | null;
}

export interface StrapiHomeData {
  title: string;
  subtitle: string;
  description: string;
  image1: StrapiMedia;
  image2: StrapiMedia;
}

export interface StrapiHistoryData {
  title: string;
  subtitle: string;
  description: string;
  image: StrapiMedia;
}

export interface StrapiServiceItem {
  id: number;
  title: string;
  description: string;
  image: StrapiMedia | null;
}

export interface StrapiServiceData {
  title: string;
  subtitle: string;
  services: StrapiServiceItem[];
}

export interface StrapiContactData {
  address: string;
  phone: string;
  email: string;
}

export interface StrapiMetric {
  id: number;
  name: string;
  value: number;
}

export interface StrapiStatisticData {
  metrics: StrapiMetric[];
}

export interface StrapiResponse<T> {
  data: T | null;
  meta?: Record<string, unknown>;
}
