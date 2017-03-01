#Ya-sync
=======

For start using you need:
 - Register app on https://oauth.yandex.ru
 - You will receive clientId
 - Obtain token. https://oauth.yandex.ru/authorize?response_type=token&client_id=<your_client_id>
 - Save token to `config/config.js`

Also you can access to yandex disk api through [Basic authorisation](https://tech.yandex.ru/disk/doc/dg/concepts/quickstart-docpage/#oauth_1)

#####There is no test yet.#####

##Upload
####Usage: 
`./upload.js [options] <localPath> <remotePath>`

Command will upload local files to your yandex disk accound.


####Options

    -h, --help     output usage information
    -V, --version  output the version number
    -v --verbose   Show progress

##Download
`./download.js -v /torrents/ ./folder_for_save_torrent_file/`

Command will download torrent-file from remote /torrents folder
#####Options
`-v --verbose - Show progress`

It not simple dowloader. It will download first file in folder and remove them.
I am using this script for grab torrent files and save to watch dir in transmission.
