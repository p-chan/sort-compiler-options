import { test, expect, describe } from 'vitest'

import { sort } from './sort'

describe('compilerOptions', () => {
  const compilerOptions = {
    plugins: [{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }],
    noEmit: true,
    outDir: './dist',
    declaration: true,
    typeRoots: ['./node_modules/@types', './src/@types'],
    paths: {
      '@foo/*': ['./src/foo/*'],
      '@bar/*': ['./src/bar/*'],
      '@baz/*': ['./src/baz/*'],
    },
    baseUrl: './',
  }

  const sortedCompilerOptions = sort(compilerOptions)

  test('root level keys', () => {
    expect(Object.keys(sortedCompilerOptions)).toEqual([
      'baseUrl',
      'paths',
      'typeRoots',
      'declaration',
      'noEmit',
      'outDir',
      'plugins',
    ])
  })

  test('baseUrl', () => {
    expect(sortedCompilerOptions.baseUrl).toBe('./')
  })

  test('paths', () => {
    expect(Object.keys(sortedCompilerOptions.paths)).toEqual(['@bar/*', '@baz/*', '@foo/*'])
  })

  test('plugins', () => {
    expect(sortedCompilerOptions.plugins).toEqual([{ name: 'foo' }, { name: 'bar' }, { name: 'baz' }])
  })
})
