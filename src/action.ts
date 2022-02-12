import { lstat, readFile, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { TsConfigJson } from 'type-fest'
import consola from 'consola'
import prettier from 'prettier'

import { sort } from './sort'

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

    tsConfigJson.compilerOptions = sort(tsConfigJson.compilerOptions)

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
