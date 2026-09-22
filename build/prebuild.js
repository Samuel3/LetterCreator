/**
 * Created by Samuel on 30.03.2018.
 */
const fs = require("fs")

let version = process.env.VERSION
if (!version) {
  console.error("VERSION environment variable is required for release builds")
  process.exit(1)
}

// Git tags are often v-prefixed; package.json must use plain semver.
if (version.startsWith("v")) {
  version = version.slice(1)
}

// electron-builder defaults to "draft"; must match the GitHub release type or uploads are skipped.
const releaseType =
  process.env.RELEASE_TYPE ||
  (version.includes("-") ? "prerelease" : "release")

console.info(
  `Preparing release build with version ${version} (releaseType=${releaseType})`
)

const mainBuildFile = JSON.parse(fs.readFileSync("package.json", "utf8"))
const appBuildFile = JSON.parse(fs.readFileSync("app/package.json", "utf8"))

mainBuildFile.version = version
appBuildFile.version = version

mainBuildFile.build.publish = {
  ...mainBuildFile.build.publish,
  releaseType,
}

fs.writeFileSync("package.json", JSON.stringify(mainBuildFile, null, 2) + "\n")
fs.writeFileSync(
  "app/package.json",
  JSON.stringify(appBuildFile, null, 2) + "\n"
)
