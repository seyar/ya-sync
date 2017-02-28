#Ya-sync#
=======

Script allow to backup any folder through local copy, ssh(use rsync) or webdav api of yandex disk. This plugin requires Grunt ~0.4.0

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.

You need to edit ```lib/config.js``` file. Fill your remote root folder eq. ```/``` and localRoot eq. ```/var/www```. Also you need to create yandex disk [application](https://oauth.yandex.ru/client/my) and get [OAuth](https://oauth.yandex.ru/) token.
Short:
 Register app
 You will receive clientId
 Go to https://oauth.yandex.ru/authorize?response_type=token&client_id=<your_client_id>
 You will see token

Also you can access to yandex disk api through [Basic authorisation](https://tech.yandex.ru/disk/doc/dg/concepts/quickstart-docpage/#oauth_1)

#####There is no test yet.#####

Usage:
```
node ./index.js /path_to_your_folder
```
Command will create `/no-synced/media/path_to_your_folder` in your yandex disk.

`node ./download.js -v /path_for_save_torrent_file`
Command will download torrent-file from /torrents folder
