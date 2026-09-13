import { execFileSync } from 'node:child_process';

// Use the existing Git credential helper; never print or persist credentials.
const mode = process.argv[2] || 'status';
if (!['status', 'publish'].includes(mode)) throw new Error('Expected status or publish');
let credential;
try {
  credential = execFileSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  });
} catch {
  console.error('No existing GitHub HTTPS credential available.');
  process.exit(2);
}
const fields = Object.fromEntries(credential.trim().split('\n').map(line => {
  const i = line.indexOf('='); return [line.slice(0, i), line.slice(i + 1)];
}));
if (!fields.password) throw new Error('Credential helper returned no usable credential');
const headers = { Authorization: `Bearer ${fields.password}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'RobotDock-Pages-Publisher' };
const base = 'https://api.github.com/repos/xuanqisun/robotdock-demo';
async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, { method, headers, ...(body ? {body:JSON.stringify(body)} : {}) });
  const data = await response.json().catch(() => ({}));
  return {status:response.status,data};
}
let result = await request('/pages');
if (mode === 'publish' && result.status === 404) result = await request('/pages', 'POST', {source:{branch:'gh-pages',path:'/'}});
else if (mode === 'publish' && result.status === 200 && result.data.source?.branch !== 'gh-pages') {
  throw new Error('Unexpected existing Pages source; leaving it unchanged.');
}
const d = result.data;
console.log(JSON.stringify({httpStatus:result.status,url:d.html_url,status:d.status,source:d.source,message:d.message}));
if(result.status < 200 || result.status >= 300) process.exitCode=1;
