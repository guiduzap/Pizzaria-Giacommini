const { spawn } = require('child_process');
const http = require('http');

function waitForServer(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function ping() {
      http.get(url, (res) => resolve()).on('error', (err) => {
        if (Date.now() - start > timeout) return reject(new Error('Timeout waiting server'));
        setTimeout(ping, 200);
      });
    })();
  });
}

async function run() {
  console.log('Building project...');
  const build = spawn('npm', ['run', 'build'], { stdio: 'inherit', shell: true });
  await new Promise((res, rej) => build.on('exit', (c) => c === 0 ? res() : rej(new Error('build failed'))));

  console.log('Starting server...');
  const proc = spawn('node', ['js/server.js'], { stdio: 'inherit', shell: true });

  try {
    await waitForServer('http:
  } catch (err) {
    proc.kill();
    throw err;
  }

  const fetch = global.fetch || ((url, opts) => new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? require('https') : require('http');
    const u = new URL(url, 'http:
    const req = lib.request(u, { method: opts && opts.method ? opts.method : 'GET', headers: opts && opts.headers ? opts.headers : {} }, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => resolve({ ok: res.statusCode >=200 && res.statusCode < 300, status: res.statusCode, text: async () => body, json: async () => JSON.parse(body) }));
    });
    req.on('error', reject);
    if (opts && opts.body) req.write(opts.body);
    req.end();
  }));

  try {
    console.log('Testing GET /api/clientes (expect array)');
    let r = await fetch('http:
    if (!r.ok) throw new Error('GET /api/clientes failed');

    console.log('Creating cliente POST /api/clientes');
    r = await fetch('http:
    if (r.status !== 201) throw new Error('POST /api/clientes failed');

    console.log('Creating produto POST /api/produtos');
    r = await fetch('http:
    if (r.status !== 201) throw new Error('POST /api/produtos failed');
    const prod = await r.json();

    console.log('Creating pedido POST /api/pedidos');
    
    const clientes = await (await fetch('http:
    const clienteId = clientes[0] && clientes[0].id ? clientes[0].id : 1;
    r = await fetch('http:
    if (r.status !== 201) throw new Error('POST /api/pedidos failed');

    console.log('Fetching relatorio');
    r = await fetch('http:
    if (!r.ok) throw new Error('GET /api/relatorios failed');

    console.log('All API smoke tests passed');
  } finally {
    proc.kill();
  }
}

run().catch(err => { console.error(err); process.exit(1); });

