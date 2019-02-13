/**
 * Created by Samuel on 12.02.2019.
 */
var http = require('http');
var Dropbox = require('dropbox').Dropbox;
const {ipcRenderer} = require("electron")

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    if (req.url == "/") {
        res.end("<html><body>" +
            "<div>Successfully logged into Dropbox</div>" +
            "<script>" +
            "console.log(document.URL);\n" +
             "var xmlHttp = new XMLHttpRequest();\n"+
            "xmlHttp.open( \"POST\", \"http://localhost:17234/accesstoken\" ); \n"+
            "xmlHttp.send( '{\"token\":document.URL}' );\n"+
            "console.log( xmlHttp.responseText) \n"+
            "</script>" +
            "</body></html>");
    } else {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log(
                body
            );
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

var box = new Dropbox();
box.setClientId("av5lekkcrbbfbgn")
console.log(box.getAuthenticationUrl("http://localhost:17234/"))
ipcRenderer.send("dropbox-login", box.getAuthenticationUrl("http://localhost:17234/"))


//# sourceURL=dropbox.js