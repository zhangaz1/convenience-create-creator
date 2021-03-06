#!/usr/bin/env node

const Path = require('path')
const { run } = require('../lib')
const Chalk = require('chalk')
const GitUserInfo = require('git-user-info')
const Os = require('os')

const user = GitUserInfo({ path: Path.join(Os.homedir(), '.gitconfig') })

const plan = {
  queries: [
    {
      type: 'confirm',
      name: 'organization',
      message: 'Will this creator be published to an @organization?',
      default: false
    },
    {
      type: 'input',
      name: 'organizationName',
      message: 'What is the name of organization this creator will be published to?',
      validate (input) {
        return input.startsWith('@') || 'organization must start with an @ symbol'
      },
      default: '@organization',
      when (answers) { return answers.organization }
    },
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of this creator?',
      validate (input) {
        return input.startsWith('create-') || 'name must start with "create-"'
      },
      default () {
        return Path.basename(process.cwd())
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Describe this creator?',
      default: 'Builds an npm module'
    },
    {
      type: 'input',
      name: 'username',
      message: 'Your name?',
      default: user && user.name ? user.name : ''
    },
    {
      type: 'input',
      name: 'email',
      message: 'Your email?',
      default: user && user.email ? user.email : ''
    },
    {
      type: 'input',
      name: 'license',
      message: 'What license?',
      default: 'MIT'
    },
    {
      type: 'input',
      name: 'repository',
      message: 'Url for the repository for this creator?'
    },
    {
      type: 'confirm',
      name: 'standard',
      message: `Include ${Chalk.green('linting')} with ${Chalk.yellow('standard')}?`,
      default: true
    },
    {
      type: 'confirm',
      name: 'example',
      message: `Include an example template?`,
      default: true
    }
  ],
  actions: [
    {
      type: 'copy',
      name: 'Copy Files',
      transform (path, answers) {
        const filename = Path.basename(path)
        const pathname = Path.dirname(path)
        return Path.join(pathname, filename
          .replace(/^_/, '.')
          .replace(/\.hbs$/, ''))
      },
      files (answers) {
        const path = answers.example ? 'copy/example' : 'copy/blank'
        return [
          {
            source: Path.join(__dirname, path),
            target: Path.join(process.cwd(), '.'),
            files: `.${Path.sep}**${Path.sep}*`
          }
        ]
      }
    },
    {
      type: 'template',
      name: 'Templates',
      transform (path, answers) {
        const filename = Path.basename(path)
        const pathname = Path.dirname(path)
        return Path.join(pathname, filename
          .replace(/^_/, '')
          .replace(/\.hbs$/, ''))
      },
      files (answers) {
        return [
          {
            source: Path.join(__dirname, 'template'),
            target: Path.join(process.cwd(), '.'),
            files: `./*`
          }
        ]
      }
    },
    {
      type: 'command',
      name: 'Commands',
      commands (answers) {
        return [
          { cmd: 'npm', args: ['install'] },
          { cmd: 'git', args: ['init'] }
        ]
      }
    }
  ]
}

run(plan)
