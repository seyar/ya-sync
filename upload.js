#!/usr/bin/env node
'use strict';
var programm = require('commander');
var Sync = require('./lib/webdav-r-sync');
var packageJson = require('./package.json');

programm
    .version(packageJson.version)
    .description('Yandex disk syncronizer.')
    .usage('[options] <localPath> <remotePath>')
    .arguments('<remotePath> <localPath>')
    .action(function (remote, local) {
        remotePath = remote;
        localPath = local;
    })
    .option('-v --verbose', 'Show progress')
    .parse(process.argv);

var dir = programm.args[programm.args.length - 1] || '/Volumes/Data/media/photos';

var s = new Sync({localRoot: dir, verbose: Boolean(programm.verbose)});
s.run();
