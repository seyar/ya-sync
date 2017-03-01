#!/usr/bin/env node
'use strict';
var programm = require('commander');
var Upload = require('./lib/upload');
var packageJson = require('./package.json');
var config = require('./config/config');

var remotePath = config.defaultUploadFolder;
var localPath = process.cwd();

programm
    .version(packageJson.version)
    .description('Yandex disk uploader.')
    .usage('[options] <localPath> <remotePath>')
    .arguments('<localPath> <remotePath>')
    .action(function (local, remote) {
        localPath = local;
        remotePath = remote;
    })
    .option('-v --verbose', 'Show progress')
    .parse(process.argv);

var upload = new Upload({
    localPath: localPath,
    remotePath: remotePath,
    verbose: Boolean(programm.verbose)
});
upload.run();
