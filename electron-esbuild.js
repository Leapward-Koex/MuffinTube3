require('esbuild').build({
    entryPoints: ['electron/main.ts'],
    bundle: true,
    outfile: 'electron/electron-bundle.js',
    tsconfig: 'electron-tsconfig.json',
    platform: 'node',
    external: ['electron'],
    sourcemap: 'both'
  }).catch(() => process.exit(1))