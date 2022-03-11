require('esbuild').build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    outfile: 'electron/electron-bundle.js',
    tsconfig: 'electron-tsconfig.json',
    platform: 'node',
    external: ['electron'],
    sourcemap: 'external',
    minify: true,
    legalComments: 'external'
  }).catch(() => process.exit(1))