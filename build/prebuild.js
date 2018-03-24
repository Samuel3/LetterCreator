var fs = require("fs");

var mainBuildFile = JSON.parse(fs.readFileSync("package.json"));
var minorBuildVersion = JSON.parse(fs.readFileSync("app/package.json")).version;

mainBuildFile.version = minorBuildVersion;

fs.writeFileSync("package.json", JSON.stringify(mainBuildFile, null, 2));