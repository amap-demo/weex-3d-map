# Weex Web Packer

WWP (Weex Web Packer) is for weex-html5 to pack specified features in the distribution bundle. The features include components and APIs and etc. For example, you want pack only the basic components like 'div', 'text', 'image', you can specify the three components in the `.wwprc` file in the root path of weex project, then run the `npm run dist` to pack a weex-html5 bundle. The packed file is in the path `./dist/weex-html5/dist/weex.js`. 

## usage

### install

```
npm install wwp --save-dev
```

We strongly suggest you install WWP in the root path of the weex project, neither your project using weex, nor the global environment using `--global`.
You can put the command runnning statement in the scripts config of the npm package file.

### config file

There should be a `.wwprc` file in the root path of the weex project to specify the features to be packed in. And also you can specify the file path and name in this form `wwp --config your/path/to/config.file`

a `.wwprc` file's content looks like this:

```
{
  "components": [
    "image",
    "text",
    "scrollable",
    "slider",
    "indicator",
    "tabheader",
    "input",
    "video",
    "switch",
    "spinner"
  ],
  "apis": [
    "dom",
    "event",
    "pageInfo",
    "stream",
    "modal",
    "animation",
    "navigator"
  ]
}
```

there are other options, but it's better to ignore it because the default value of these options is for the current directory architecture of weex project.

* `packer`: absolute path of the generated packer file (relative to the root).
* `componentsPath`: abslute path of the components' directory (relative to the root).
* `loaersPath`: absolute path of the loaders' directory (relative to the root).
* `apisPath`: the path of the APIs' directory (relative to the root).

### run the command

```
wwp --config ./.wwprc
```

**Note**: WWP is only to generate the feature importing file, not the final distributing bundle. After finished running the `wwp` command, you should still run the dist script for weex-html5 (`npm run dist`).

**Note**: You'd better run the `wwp` command in the npm scripts, who's executing working directory is the root of the weex project. Otherwise you should always run the `wwp` command in the root path of the weex project.

## options

### `-c`

Alias for `--config`, specifying the config file for the WWP. default value is `./.wwprc`.

### `-d`

Alias for `--debug`, specifying whether to log out the debug informations in WWP's processing progress.

## reference: how to extend a component/api in weex-html5 ?

* [weex_extend_demo](https://github.com/MrRaindrop/weex_extend_demo): a example for defining your own component in weex-html5. 
* [doc: extend to web](http://alibaba.github.io/weex/doc/advanced/extend-to-html5.html): official document for extending components and APIs in weex-html5.
