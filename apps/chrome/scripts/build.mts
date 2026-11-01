import { cp, rm } from 'node:fs/promises'

import { type Plugin, bundle, watch } from '@staple/tools'

const staticFiles: [string, string][] = [
  ['manifest.json', 'dist/manifest.json'],
  ['src/action/action.html', 'dist/action/action.html'],
  ['src/action/action.css', 'dist/action/action.css'],
  ['src/options/options.html', 'dist/options/options.html'],
  ['src/options/options.css', 'dist/options/options.css'],
  ['src/ui/chrome.css', 'dist/ui/chrome.css'],
  ['media', 'dist/media'],
]

const copyStatic: Plugin = {
  name: 'copy-static',
  setup(pluginBuild) {
    pluginBuild.onEnd(async () => {
      await Promise.all(staticFiles.map(([source, target]) => cp(source, target, { recursive: true })))
    })
  },
}

await rm('dist', { recursive: true, force: true })

await bundle({
  entryPoints: ['src/background.ts', 'src/action/action.ts', 'src/options/options.ts'],
  format: 'esm',
  platform: 'browser',
  target: 'chrome121',
  sourcemap: watch,
  plugins: [copyStatic],
})
