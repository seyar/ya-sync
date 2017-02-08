#!/usr/bin/env node
'use strict';
var programm = require('commander');
var Sync = require('./lib/webdav-r-sync');

programm
    .version('0.0.1')
    .description('Yandex disk syncronizer usage node index.js [options] <file>')
    .usage('[options] <file>')
    .option('-v --verbose', 'Show progress')
    .parse(process.argv);

var dir = programm.args[programm.args.length - 1] || '/Volumes/Data/media/photos';

var s = new Sync({localRoot: dir, verbose: Boolean(programm.verbose)});
s.run();
