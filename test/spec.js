const Application = require('spectron').Application
const assert = require('assert')
const path = require('path')

// Get electron path - try different methods for compatibility
const fs = require('fs');
let electronPath;

try {
    // Try to require electron - this should return the path to the electron executable
    electronPath = require('electron');
    
    // Verify the path exists
    if (!fs.existsSync(electronPath)) {
        throw new Error('Electron path does not exist');
    }
} catch (e) {
    // Fallback: try to find electron executable in common locations
    if (process.platform === 'win32') {
        const possiblePaths = [
            path.join(__dirname, '../node_modules/.bin/electron.cmd'),
            path.join(__dirname, '../node_modules/.bin/electron.exe'),
            path.join(__dirname, '../node_modules/electron/dist/electron.exe'),
            path.join(__dirname, '../app/node_modules/electron/dist/electron.exe')
        ];
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                electronPath = possiblePath;
                break;
            }
        }
    } else {
        const possiblePaths = [
            path.join(__dirname, '../node_modules/.bin/electron'),
            path.join(__dirname, '../app/node_modules/.bin/electron')
        ];
        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                electronPath = possiblePath;
                break;
            }
        }
    }
    
    if (!electronPath) {
        console.warn('Warning: Could not find electron executable. E2E tests will be skipped.');
    }
}

describe('Application launch', function () {
    this.timeout(300000);

    before(function() {
        if (!electronPath) {
            console.log('Skipping E2E tests: Electron path not found');
            this.skip();
        }
        
        // Check if main.js exists
        const mainJsPath = path.join(__dirname, '../app/main.js');
        if (!fs.existsSync(mainJsPath)) {
            console.log('Skipping E2E tests: app/main.js not found');
            this.skip();
        }
    });

    beforeEach(function () {
        if (!electronPath) {
            return Promise.resolve();
        }

        const mainJsPath = path.join(__dirname, '../app/main.js');
        this.app = new Application({
            path: electronPath,
            args: [mainJsPath],
            env: {
                NODE_ENV: 'test'
            },
            startTimeout: 30000,
            waitTimeout: 30000,
            chromeDriverArgs: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        return this.app.start().catch(function(error) {
            console.error('Failed to start application:', error);
            console.error('Electron path:', electronPath);
            console.error('Main.js path:', mainJsPath);
            throw error;
        });
    });

    afterEach(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop().catch(function(error) {
                console.error('Error stopping application:', error);
            });
        }
    });

    it('shows an initial window', function () {
        if (!this.app || !this.app.isRunning()) {
            this.skip('Application not running. Skipping test.');
            return;
        }

        return this.app.client.waitUntilWindowLoaded(10000)
            .then(() => this.app.client.getWindowCount())
            .then(function (count) {
                // Note: getWindowCount() will return 2 if dev tools are opened
                assert.ok(count >= 1, `Expected at least 1 window, got ${count}`);
            })
            .catch(function(error) {
                console.error('Error in test:', error);
                throw error;
            });
    });
});

describe("Unit tests", function () {

    it("check all keys in lang files existing", function () {
        var de = require("../app/i18n/de.json");
        var en = require("../app/i18n/en.json");
        assert.equal(Object.keys(de).length, Object.keys(en).length);
    })

});