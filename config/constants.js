const DEFAULT_BASE_URL = 'https://www.carloschaves.com';

export const BASE_URL = process.env.BASE_URL || DEFAULT_BASE_URL;
export const MAX_PAGES = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES) : 50;
export const TIMEOUT = process.env.TIMEOUT ? parseInt(process.env.TIMEOUT) : 30000;

export const CRITICAL_PAGES = [
  '/cv/',
  '/',
  '/case-studies/'
];

export const SOCIAL_MEDIA_DOMAINS = [
  'linkedin.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com'
];