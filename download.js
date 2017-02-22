#!/usr/bin/env node
'use strict';
var programm = require('commander');
var Downloader = require('./lib/downloader');
var packageJson = require('./package.json');
var path = require('path');

programm
    .version(packageJson.version)
    .description('Downloads torrent file and remove them in Ya folder.')
    .usage('[options] <file>')
    .option('-v --verbose', 'Show progress')
    .parse(process.argv);

var dir = programm.args[programm.args.length - 1] || process.cwd();

new Downloader({destination: dir, verbose: Boolean(programm.verbose)});
