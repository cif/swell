// nomnom cli options parser
// https://github.com/harthur/nomnom
// 2014-04-07
// github.com/cif/swell
// email@benipsen.com

var nom     = require('nomnom');
exports.nom = nom()
       .help('Swell is a toolkit used to build out advanced web apps. See http://github.com/cif/swell for more info.' + "\n\n")
       .option('new', {
          abbr: 'n',
          help: "create a new workspace with <name> in the current directory\n"
       })
       .option('watch', {
          abbr: 'w',
          flag: true,
          help: "watch and recompile coffee, template, and style files when changed\n"
       })
       .option('server', {
          abbr: 's',
          flag: true,
          help: "spin up an express server on the port speficied by configuration file\n"
       })
       .option('file', {
          abbr: 'f',
          help: "configuration <file> to be used instead of default [swell.json]\n"
       })
       .option('package', {
          abbr: 'p',
          flag: true,
          help: "package dependencies, templates and application files to a single production file\n"
       })
       .option('config', {
          abbr: 'c',
          help: "set a new or existing configuration variable in your json <key> <value>. (use quotes)\n"
       })
       .option('remove', {
          abbr: 'r',
          help: "remove a <key> from json configuration. (use quotes)\n"
       })
       .nocolors().nom();
       
           