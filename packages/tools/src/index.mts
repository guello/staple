import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { glob } from 'node:fs/promises'

import { type BuildOptions, type Plugin, build, context } from 'esbuild'

export { type BuildOptions, type Plugin } from 'esbuild'

const TEST_OUTPUT_DIR = 'node_modules/.cache/staple-test'

export const watch = process.argv.includes('--watch')

export const bundle = async (options: BuildOptions): Promise<void> => {
  const config: BuildOptions = {
    outdir: 'dist',
    outbase: 'src',
    bundle: true,
    minify: !watch,
    logLevel: 'info',
    ...options,
  }
  if (!watch) {
    await build(config)
    return
  }
  await (await context(config)).watch()
}

export interface TestOptions {
  target: string
  globals?: string[]
  modules?: string[]
}

const escapeRegExp = (value: string) => value.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`),
  stubModules = (modules: string[]): Plugin => ({
    name: 'stub-modules',
    setup(compilation) {
      const filter = new RegExp(`^(?:${modules.map(name => escapeRegExp(name)).join('|')})$`)
      compilation.onResolve({ filter }, ({ path }) => ({ namespace: 'stub-module', path }))
      compilation.onLoad({ filter: /.*/, namespace: 'stub-module' }, () => ({
        contents: 'module.exports = {}',
        loader: 'js',
      }))
    },
  })

export const test = async ({ target, globals = [], modules = [] }: TestOptions): Promise<void> => {
  const entryPoints: string[] = []
  for await (const file of glob('src/**/*.test.ts')) entryPoints.push(file)
  if (entryPoints.length === 0) throw new Error('No test files found')

  const result = await build({
    entryPoints,
    outdir: TEST_OUTPUT_DIR,
    outbase: 'src',
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target,
    metafile: true,
    logLevel: 'warning',
    banner: { js: globals.map(name => `globalThis.${name} ??= {};`).join('') },
    plugins: modules.length > 0 ? [stubModules(modules)] : [],
  })

  for (const output of Object.keys(result.metafile.outputs)) {
    const child = spawn(process.execPath, [output], { stdio: 'inherit' }),
      [code] = (await once(child, 'close')) as [number | null]
    if (code !== 0) {
      process.exitCode = code ?? 1
      return
    }
  }
}
