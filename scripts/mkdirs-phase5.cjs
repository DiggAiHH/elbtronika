const fs = require('fs')
const path = require('path')
const root = path.join(__dirname, '..')

const dirs = [
  'apps/web/app/[locale]/dashboard/artist',
  'apps/web/app/[locale]/dashboard/artist/new',
  'apps/web/__tests__/api/assets',
]

for (const d of dirs) {
  fs.mkdirSync(path.join(root, d), { recursive: true })
  console.log('created:', d)
}
