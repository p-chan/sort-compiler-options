import { lstat, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { TsConfigJson } from 'type-fest'
import consola from 'consola'
import prettier from 'prettier'

import { order } from './order'

type Object = {
  [key: string]: any
}

type Options = {
  '--': any[]
  c: string
  config: string
}

export const action = async (options: Options) => {
  try {
    const tsConfigJsonPath = resolve(process.cwd(), (options.c || options.config) ?? 'tsconfig.json')

    const isExistsTsConfigJson = await (async () => {
      try {
        return (await lstat(tsConfigJsonPath)).isFile()
      } catch (e) {
        return false
      }
    })()

    if (!isExistsTsConfigJson) throw new Error('tsconfig is not found')

    const tsConfigJson = JSON.parse(await readFile(tsConfigJsonPath, 'utf-8')) as TsConfigJson

    if (tsConfigJson.compilerOptions == undefined) throw new Error('compilerOptions is not defined')

    const nextCompilerOptions: Object = {}

    Object.keys(tsConfigJson.compilerOptions)
      .sort((a, b) => {
        let aIndex = order.findIndex((key) => key === a)
        let bIndex = order.findIndex((key) => key === b)

        aIndex = aIndex >= 0 ? aIndex : Number.MAX_SAFE_INTEGER
        bIndex = bIndex >= 0 ? bIndex : Number.MAX_SAFE_INTEGER

        if (aIndex > bIndex) return 1
        if (aIndex < bIndex) return -1

        return 0
      })
      .forEach((key) => {
        nextCompilerOptions[key] = (tsConfigJson.compilerOptions as Object)[key]
      })

    tsConfigJson.compilerOptions = nextCompilerOptions

    const tsConfigJsonString = JSON.stringify(tsConfigJson)

    const prettierOptions = await (async () => {
      const prettierConfigFilePath = await prettier.resolveConfigFile()

      if (prettierConfigFilePath == undefined) return {}

      return await prettier.resolveConfig(prettierConfigFilePath)
    })()

    await writeFile(
      tsConfigJsonPath,
      prettier.format(tsConfigJsonString, {
        parser: 'json-stringify',
        ...prettierOptions,
      }),
      'utf-8'
    )

    consola.success('Sorted compilerOptions')
  } catch (error) {
    consola.error(error)
  }
}
