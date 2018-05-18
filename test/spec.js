const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {
    this.timeout(300000);

    beforeEach(function () {
        this.app = new Application({
            // Your electron path can be any binary
            // i.e for OSX an example path could be '/Applications/MyApp.app/Contents/MacOS/MyApp'
            // But for the sake of the example we fetch it from our node_modules.
            path: electronPath,
            args: [path.join(__dirname, '../app/main.js')]
        });
        return this.app.start()
    });

    afterEach(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop()
        }
    });

    it('shows an initial window', function () {
        return this.app.client.getWindowCount().then(function (count) {
            assert.equal(count, 1)
            // Please note that getWindowCount() will return 2 if `dev tools` are opened.
            // assert.equal(count, 2)
        })
    });
});

describe("Unit tests", function () {

    it("check all keys in lang files existing", function () {
        var de = require("../app/i18n/de.json");
        var en = require("../app/i18n/en.json");
        assert.equal(Object.keys(de).length, Object.keys(en).length);
    })

});