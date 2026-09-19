/**
 * Created by Samuel on 30.03.2018.
 */
const fs = require("fs")

let version = process.env.VERSION
console.info("Preparing release build with version " + version);

var mainBuildFile = JSON.parse(fs.readFileSync("package.json"));
var appBuildFile = JSON.parse(fs.readFileSync("app/package.json"));
mainBuildFile.version = version;
appBuildFile.version = version;

fs.writeFileSync("package.json", JSON.stringify(mainBuildFile, null, 2));
fs.writeFileSync("app/package.json", JSON.stringify(appBuildFile, null, 2));