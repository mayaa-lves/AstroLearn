// Servidor de desenvolvimento. Sem dependências e sem executar o backend.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const port = Number(process.env.PORT || 3000);
const mime = {'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.pdf':'application/pdf','.zip':'application/zip','.mp4':'video/mp4','.txt':'text/plain; charset=utf-8'};
function fail(res, code, text) { res.writeHead(code, {'Content-Type':'text/plain; charset=utf-8'}); res.end(text); }
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) return fail(res, 405, 'Método não permitido.');
  try {
    const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let file = path.resolve(root, '.' + route);
    if (file !== root && !file.startsWith(root + path.sep)) return fail(res, 403, 'Acesso negado.');
    let stat = fs.statSync(file);
    if (stat.isDirectory()) {
      if (!route.endsWith('/')) { res.writeHead(302, {Location:route + '/' + new URL(req.url, 'http://localhost').search}); return res.end(); }
      file = path.join(file, 'index.html'); stat = fs.statSync(file);
    }
    if (!stat.isFile()) return fail(res, 404, 'Arquivo não encontrado.');
    const headers={'Content-Type':mime[path.extname(file).toLowerCase()] || 'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store','Accept-Ranges':'bytes'};
    // Vídeos precisam de intervalos HTTP para rever um trecho sem reiniciar o arquivo.
    if(req.method==='GET'&&req.headers.range){
      const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      const invalid=()=>{res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();};
      if(!range||(!range[1]&&!range[2]))return invalid();
      let start=range[1]?Number(range[1]):Math.max(0,stat.size-Number(range[2]));
      let end=range[1]&&range[2]?Math.min(Number(range[2]),stat.size-1):stat.size-1;
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=stat.size||(!range[1]&&Number(range[2])===0))return invalid();
      headers['Content-Length']=end-start+1;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;
      res.writeHead(206,headers);fs.createReadStream(file,{start,end}).on('error',()=>res.destroy()).pipe(res);return;
    }
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch (e) {
    fail(res, e.code === 'ENOENT' || e.code === 'ENOTDIR' ? 404 : 400, 'Não foi possível abrir este arquivo. Confira o caminho e public/js/config.js.');
  }
});
server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? 'Porta ocupada. Feche o outro servidor ou altere PORT.' : e.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`AstroLearn: http://localhost:${port}\nAluno: /aluno/home.html · Professor: /professor/home.html\nCtrl+C para encerrar.`));
