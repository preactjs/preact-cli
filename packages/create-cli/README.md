# `create-preact-cli`

> Start building a [Preact](https://github.com/preactjs/preact) Progressive Web App in seconds 🔥

This will become the method for creating new Preact-CLI projects in v4.

### Requirements

> **Important**: [Node.js](https://nodejs.org/en/) >= v14 is required.

### Usage

```sh
$ npm init preact-cli <template-name> <project-name>

$ yarn create preact-cli <template-name> <project-name>
```

Example:

```sh
$ npm init preact-cli default my-project
```

The above command pulls the template from [preactjs-templates/default](https://github.com/preactjs-templates/default), prompts for some information, and generates the project at `./my-project`.

### Official Templates

The purpose of official preact project templates are to provide opinionated development tooling setups so that users can get started with actual app code as fast as possible. However, these templates are un-opinionated in terms of how you structure your app code and what libraries you use in addition to preact.js.

All official project templates are repos in the [preactjs-templates organization](https://github.com/preactjs-templates). When a new template is added to the organization, you will be able to run `npm init preact-cli <template-name> <project-name>` to use that template.

Current available templates include:

- [default](https://github.com/preactjs-templates/default) - Default template with all features

- [typescript](https://github.com/preactjs-templates/default) - Default template implemented in TypeScript

> 💁 Tip: Any Github repo with a `'template'` folder can be used as a custom template: <br /> `npm init preact-cli <username>/<repository> <project-name>`

### CLI Options

#### preact list

Lists all the official preactjs-cli repositories

```sh
$ [npm init / yarn create] preact-cli list
```

#### preact create

Create a project to quick start development.

```
$ [npm init / yarn create] preact-cli <template-name> <project-name>

  --name        The application name.
  --cwd         A directory to use instead of $PWD.
  --force       Force option to create the directory for the new app  [boolean] [default: false]
  --git         Initialize version control using git.                 [boolean] [default: false]
  --install     Installs dependencies.                                [boolean] [default: true]
```
