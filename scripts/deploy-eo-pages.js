/**
 * Universal EO Pages deployment script
 * Usage: node scripts/deploy-eo-pages.js --dir <dist_dir> --name <EO_project_name>
 * Example:
 *   node scripts/deploy-eo-pages.js --dir dist --name type-words-deploy
 *   node scripts/deploy-eo-pages.js -d dist -n vscode-web-deploy
 *
 * Environment variables: EO_PAGES_TOKEN (required)
 */

const { spawn } = require('child_process')
const path = require('path')

const argv = process.argv.slice(2)
function getArg(name, short) {
  const i = argv.indexOf(name)
  const iShort = short != null ? argv.indexOf(short) : -1
  const idx = i >= 0 ? i : iShort
  if (idx >= 0 && argv[idx + 1]) return argv[idx + 1]
  return null
}

const dir = getArg('--dir', '-d') || 'dist'
const name = getArg('--name', '-n')

if (!name) {
  console.error('❌ Missing EO Pages project name, please specify with --name or -n')
  process.exit(1)
}

const { EO_PAGES_TOKEN } = process.env
if (!EO_PAGES_TOKEN) {
  console.error('❌ Missing required environment variable EO_PAGES_TOKEN, please check GitHub Secrets configuration')
  process.exit(1)
}

const distPath = path.resolve(process.cwd(), dir)
const cmd = `edgeone pages deploy "${distPath}" -n ${name} -t ${EO_PAGES_TOKEN}`

const child = spawn(cmd, [], { shell: true, stdio: 'inherit' })
child.on('close', (code) => {
  process.exit(code ?? 0)
})

