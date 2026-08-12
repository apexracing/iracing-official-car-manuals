import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://iracing-official-car-manuals.pages.dev',
  output: 'static',
});
