#!/usr/bin/env node

import { cac } from 'cac'

import { action } from './action'
import { version } from './version'

const cli = cac()

cli
  .command('')
  .option('-c, --config <path>', 'Specify tsconfig file path', {
    default: 'tsconfig.json',
  })
  .action(action)

cli.help()
cli.version(version)

cli.parse()
