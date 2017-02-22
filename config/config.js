module.exports = {
    remoteRoot: 'no-synced/media/',

    sync: {
        url: 'https://webdav.yandex.ru/',
        method: 'GET',
        headers: {
            Authorization: 'OAuth Aw'
        }
    },

    torrentsDownloader: {
        folder: '/torrents/'
    }
};
