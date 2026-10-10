import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';
const root=resolve('dist');
createServer((req,res)=>{const path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}try{const target=path===root?resolve(root,'index.html'):path;const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json'};res.setHeader('Content-Type',types[extname(target)]||'application/octet-stream');res.end(readFileSync(target));}catch{res.writeHead(404).end('Introuvable');}}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
