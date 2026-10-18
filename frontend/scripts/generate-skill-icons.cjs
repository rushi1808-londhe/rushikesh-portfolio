const { getIconData } = require('@iconify/utils');
const fs = require('fs');
const sets = {
  logos: require('@iconify-json/logos/icons.json'),
  devicon: require('@iconify-json/devicon/icons.json'),
  'simple-icons': require('@iconify-json/simple-icons/icons.json'),
  tabler: require('@iconify-json/tabler/icons.json'),
};
// id -> [set, name, monochromeColor?]
const icons = {
  java: ['logos', 'java'],
  spring: ['logos', 'spring-icon'],
  csharp: ['logos', 'c-sharp'],
  dotnet: ['logos', 'dotnet'],
  aspnet: ['devicon', 'dotnetcore'],
  api: ['tabler', 'api', '#00d4ff'],
  kafka: ['simple-icons', 'apachekafka', '#ffffff'],
  react: ['logos', 'react'],
  redux: ['logos', 'redux'],
  typescript: ['logos', 'typescript-icon'],
  javascript: ['logos', 'javascript'],
  html5: ['logos', 'html-5'],
  css3: ['logos', 'css-3'],
  tailwind: ['logos', 'tailwindcss-icon'],
  bootstrap: ['logos', 'bootstrap'],
  postgresql: ['logos', 'postgresql'],
  mysql: ['logos', 'mysql-icon'],
  mongodb: ['logos', 'mongodb-icon'],
  mssql: ['devicon', 'microsoftsqlserver'],
  docker: ['logos', 'docker-icon'],
  git: ['logos', 'git-icon'],
  github: ['simple-icons', 'github', '#ffffff'],
  githubactions: ['logos', 'github-actions'],
  jenkins: ['logos', 'jenkins'],
  linux: ['logos', 'linux-tux'],
  aws: ['simple-icons', 'amazonwebservices', '#ff9900'],
  jwt: ['logos', 'jwt-icon'],
  keycloak: ['simple-icons', 'keycloak', '#33c6e9'],
  rbac: ['tabler', 'users-group', '#00d4ff'],
  swagger: ['logos', 'swagger'],
  hibernate: ['devicon', 'hibernate'],
  database: ['tabler', 'database', '#00d4ff'],
  nodejs: ['logos', 'nodejs-icon'],
  python: ['logos', 'python'],
  redis: ['logos', 'redis'],
  kubernetes: ['logos', 'kubernetes'],
  nginx: ['logos', 'nginx'],
  angular: ['logos', 'angular-icon'],
  vue: ['logos', 'vue'],
  windows: ['logos', 'microsoft-windows-icon'],
  code: ['tabler', 'code', '#00d4ff'],
};
// Brand colours too dark to read on a near-black keycap get a lighter tint of the same hue.
const RECOLOR = { mysql: { '#00546B': '#3d9cc0', '#00546b': '#3d9cc0' } };
const out = {};
for (const [id, [set, name, color]] of Object.entries(icons)) {
  const data = getIconData(sets[set], name);
  if (!data) throw new Error(`missing ${set}:${name}`);
  let body = data.body;
  if (color) body = body.replace(/currentColor/g, color);
  for (const [from, to] of Object.entries(RECOLOR[id] || {})) body = body.split(from).join(to);
  if (set === 'simple-icons' && !/fill=/.test(body)) body = `<g fill="${color}">${body}</g>`;
  out[id] = { body, width: data.width ?? sets[set].width ?? 24, height: data.height ?? sets[set].height ?? 24 };
}
const ts = `// Generated from the official Iconify sets (logos, devicon, simple-icons, tabler).
// Bundled as data so @iconify/react renders offline without calling the Iconify API.
import type { IconifyIcon } from '@iconify/react';

export const ICONS = ${JSON.stringify(out, null, 2)} satisfies Record<string, IconifyIcon>;

export type IconId = keyof typeof ICONS;
`;
fs.writeFileSync(process.argv[2], ts);
console.log(Object.keys(out).length, 'icons,', (ts.length / 1024).toFixed(1), 'KB');
