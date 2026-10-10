import {build} from 'esbuild';
import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
mkdirSync('dist/assets',{recursive:true});
await build({entryPoints:['src/main.tsx'],bundle:true,outfile:'dist/assets/app.js',platform:'browser',format:'esm',minify:true,jsx:'automatic',preserveSymlinks:true,define:{'process.env.NODE_ENV':'"production"'}});
copyFileSync('public/firebase-config.json','dist/firebase-config.json');
writeFileSync('dist/index.html','<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Votre suivi du poids, semaine après semaine"><title>BodyHappyHarmonie — Suivi clientes</title><link rel="stylesheet" href="./assets/app.css"></head><body><div id="root"></div><script type="module" src="./assets/app.js"></script></body></html>');
writeFileSync('dist/.nojekyll','');
console.log('Application construite dans dist/');
