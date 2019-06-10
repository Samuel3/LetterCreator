/**
 * Created by Samuel on 12.02.2019.
 */
var http = require('http');
var Dropbox = require('dropbox').Dropbox;
const {ipcRenderer} = require('electron');


function createWebServer(callback) {
    var box = new Dropbox();
    var token;
    box.setClientId("av5lekkcrbbfbgn")
    console.log(box.getAuthenticationUrl("http://localhost:17234/"))
    ipcRenderer.send("dropbox-login", box.getAuthenticationUrl("http://localhost:17234/"))

    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        if (req.url == "/") {
            res.end("<html><body>" +
                "<div>LetterCreator has successfully logged into dropbox. You can now close this window.</div>" +
                "<script>" +
                "console.log(document.URL);\n" +
                "var xmlHttp = new XMLHttpRequest();\n" +
                "xmlHttp.open( \"POST\", \"http://localhost:17234/accesstoken\" ); \n" +
                "xmlHttp.send( '{\"token\":\"' + document.URL + '\"}' );\n" +
                "console.log( xmlHttp.responseText) \n" +
                "</script>" +
                "</body></html>");
        } else {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                if (body !== "") {
                    token = JSON.parse(body).token
                    token = token.substr(token.indexOf("access_token=") + 13)
                    token = token.substr(0, token.indexOf("&"));
                    console.log(token)
                    callback(token)
                    ipcRenderer.send("receivedDropboxkey")
                }
                res.end('ok');
            });
            res.end("<html><body>" +
                "<div>You can close this window</div>" +
                "<script>" +
                "console.log(document.URL)" +
                "debugger" +
                "</script>" +
                "</body></html>");
        }

    }).listen(17234);
}

module.exports = function (callback) {
    return new createWebServer(callback)
}


//# sourceURL=RequestDropboxKey.js
