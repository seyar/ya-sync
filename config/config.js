module.exports = {
    login: 'seyarchapuh', // login on disk.yandex.ru
    password: '', // password on disk.yandex.ru
    clientID: '8333c729cc0640eeb66302ffead03690', // application ID
    // clientPassword: 'ee0801d5fa624306a40351980600a89d',
    // verificationCode: 'b56608838c7f4550a88ca629d2f565cd',
    // callbackUrl:https://oauth.yandex.ru/verification_code?dev=True
    // 608e527bc36543d184573cc2ad6ea711&token_type=bearer&state=

    disk: {
        remoteRoot: 'no-synced/',
        localRoot: '/Users/seyar/Documents/clientside-bkp',
        url: 'https://webdav.yandex.ru/',
        method: 'GET',
        headers: {
            Authorization: 'OAuth b56608838c7f4550a88ca629d2f565cd'
        }
    }
};

// https://oauth.yandex.ru/authorize?response_type=token&client_id=8333c729cc0640eeb66302ffead03690
// отладочный токен на 18.03.15 b56608838c7f4550a88ca629d2f565cd

// загрузка файла
// curl -v -X PUT -H 'Authorization: OAuth b56608838c7f4550a88ca629d2f565cd' -H 'Etag: 6ab3c0414f12590a2e3719a24893ea31'
// -H 'Sha256: 54c0bada752032603f9c8e29947e4cfa8819efc6894ab4bdf46388db2156e3b9' -H 'Expect: 100-continue'
// -H 'Content-Type: application/binary' -H 'Content-Length: 103134024'
// https://webdav.yandex.ru/a/Make --data-binary=@Makefile

// Создание каталога
// curl -v -X MKCOL -H 'Authorization: OAuth b56608838c7f4550a88ca629d2f565cd' https://webdav.yandex.ru/a/b
