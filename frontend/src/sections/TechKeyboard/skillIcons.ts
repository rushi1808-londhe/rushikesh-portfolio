import type { IconifyIcon } from '@iconify/react';
import { ICONS, type IconId } from './skillIcons.data';

/**
 * Maps a skill name from the API to its official logo. Skills themselves are never hardcoded:
 * this is only a lookup table, and unknown skills fall back to a generic code glyph.
 */
const ALIASES: Record<string, IconId> = {
  java: 'java',
  springboot: 'spring',
  spring: 'spring',
  springframework: 'spring',
  csharp: 'csharp',
  net: 'dotnet',
  dotnet: 'dotnet',
  netcore: 'aspnet',
  aspnet: 'aspnet',
  aspnetcore: 'aspnet',
  aspnetcorewebapi: 'aspnet',
  webapi: 'api',
  restapis: 'api',
  restapi: 'api',
  rest: 'api',
  apis: 'api',
  apachekafka: 'kafka',
  kafka: 'kafka',
  react: 'react',
  reactjs: 'react',
  redux: 'redux',
  reduxtoolkit: 'redux',
  typescript: 'typescript',
  ts: 'typescript',
  javascript: 'javascript',
  js: 'javascript',
  html: 'html5',
  html5: 'html5',
  css: 'css3',
  css3: 'css3',
  tailwind: 'tailwind',
  tailwindcss: 'tailwind',
  bootstrap: 'bootstrap',
  postgresql: 'postgresql',
  postgres: 'postgresql',
  mysql: 'mysql',
  mongodb: 'mongodb',
  mongo: 'mongodb',
  microsoftsqlserver: 'mssql',
  sqlserver: 'mssql',
  mssql: 'mssql',
  docker: 'docker',
  git: 'git',
  github: 'github',
  githubactions: 'githubactions',
  jenkins: 'jenkins',
  linux: 'linux',
  aws: 'aws',
  amazonwebservices: 'aws',
  jwt: 'jwt',
  jsonwebtoken: 'jwt',
  jsonwebtokens: 'jwt',
  keycloak: 'keycloak',
  rbac: 'rbac',
  swagger: 'swagger',
  openapi: 'swagger',
  hibernate: 'hibernate',
  jpa: 'hibernate',
  dapper: 'database',
  sql: 'database',
  nodejs: 'nodejs',
  node: 'nodejs',
  python: 'python',
  redis: 'redis',
  kubernetes: 'kubernetes',
  k8s: 'kubernetes',
  nginx: 'nginx',
  angular: 'angular',
  vue: 'vue',
  vuejs: 'vue',
  windowsserver: 'windows',
  windows: 'windows',
};

const normalize = (name: string) =>
  name
    .toLowerCase()
    .replace(/#/g, 'sharp')
    .replace(/\+/g, 'plus')
    .replace(/[^a-z0-9]/g, '');

function lookup(name: string): IconId | undefined {
  const key = normalize(name);
  return ALIASES[key] ?? ALIASES[key.replace(/\d+$/, '')] ?? ALIASES[key.replace(/(js|framework)$/, '')];
}

export function skillIcon(name: string): IconifyIcon {
  return ICONS[lookup(name) ?? 'code'];
}

/** Whether a real (non-generic) logo ships with the site for this skill name. */
export function hasBundledIcon(name: string): boolean {
  return lookup(name) !== undefined;
}
