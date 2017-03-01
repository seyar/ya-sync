#!/usr/bin/env node
'use strict';
var programm = require('commander');
var Download = require('./lib/download');
var packageJson = require('./package.json');
var path = require('path');
var config = require('./config/config');

var remotePath = config.defaultDownloadPath;
var localPath = process.cwd();

programm
    .version(packageJson.version)
    .description('Downloads torrent file and remove them in Ya folder.')
    .usage('[options] <remotePath> <localPath>')
    .arguments('<remotePath> <localPath>')
    .action(function (remote, local) {
        remotePath = remote;
        localPath = local;
    })
    .option('-v --verbose', 'Show progress')
    .parse(process.argv);

if (!remotePath) {
    console.error('Remote path is empty. Check config.js');
    process.exit(1);
}

new Download({
    localPath: localPath,
    remotePath: remotePath,
    verbose: Boolean(programm.verbose)
});
