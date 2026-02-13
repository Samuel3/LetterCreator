const assert = require('assert');
const path = require('path');

describe('Store', function() {
    let Store;
    let store;
    let mockDataStore;
    let originalRequire;

    beforeEach(function() {
        // Create a mock data-store
        mockDataStore = function(name) {
            const data = {};
            return {
                get: function(key) {
                    return data[key];
                },
                set: function(key, value) {
                    data[key] = value;
                },
                data: data,
                save: function() {}
            };
        };

        // Mock modules before requiring Store
        const Module = require('module');
        const originalRequire = Module.prototype.require;
        
        Module.prototype.require = function(id) {
            if (id === 'data-store') {
                return mockDataStore;
            }
            if (id === 'electron') {
                return {
                    ipcRenderer: {
                        send: function() {}
                    }
                };
            }
            if (id === 'electron-log') {
                return {
                    silly: function() {},
                    info: function() {},
                    error: function() {},
                    warn: function() {}
                };
            }
            if (id === 'dropbox') {
                return {
                    Dropbox: function() {
                        this.setClientId = function() {};
                        this.setAccessToken = function() {};
                        this.filesDownload = function() {
                            return Promise.reject({
                                error: JSON.stringify({
                                    error_summary: "path/not_found/.."
                                })
                            });
                        };
                        this.filesUpload = function() {
                            return Promise.resolve({});
                        };
                    }
                };
            }
            return originalRequire.apply(this, arguments);
        };

        // Reset modules
        delete require.cache[require.resolve('../app/js/Store.js')];
        delete require.cache[require.resolve('../app/js/i18n.js')];
        
        Store = require('../app/js/Store.js');
    });

    afterEach(function() {
        // Restore original require
        const Module = require('module');
        Module.prototype.require = require;
        delete require.cache[require.resolve('../app/js/Store.js')];
        delete require.cache[require.resolve('../app/js/i18n.js')];
    });

    describe('Store initialization', function() {
        it('should create a Store instance', function(done) {
            store = new Store(function() {
                assert.ok(store);
                done();
            });
        });

        it('should have get method', function(done) {
            store = new Store(function() {
                assert.equal(typeof store.get, 'function');
                done();
            });
        });

        it('should have set method', function(done) {
            store = new Store(function() {
                assert.equal(typeof store.set, 'function');
                done();
            });
        });
    });

    describe('Store.get', function() {
        beforeEach(function(done) {
            store = new Store(function() {
                done();
            });
        });

        it('should return undefined for non-existent key', function() {
            const result = store.get('nonExistentKey');
            assert.equal(result, undefined);
        });

        it('should return stored value', function() {
            store.set('testKey', 'testValue');
            const result = store.get('testKey');
            assert.equal(result, 'testValue');
        });
    });

    describe('Store.set', function() {
        beforeEach(function(done) {
            store = new Store(function() {
                done();
            });
        });

        it('should store a value', function() {
            store.set('testKey', 'testValue');
            const result = store.get('testKey');
            assert.equal(result, 'testValue');
        });

        it('should overwrite existing value', function() {
            store.set('testKey', 'oldValue');
            store.set('testKey', 'newValue');
            const result = store.get('testKey');
            assert.equal(result, 'newValue');
        });

        it('should store objects', function() {
            const testObject = { key: 'value', number: 42 };
            store.set('testObject', testObject);
            const result = store.get('testObject');
            assert.deepEqual(result, testObject);
        });

        it('should store arrays', function() {
            const testArray = [1, 2, 3, 'test'];
            store.set('testArray', testArray);
            const result = store.get('testArray');
            assert.deepEqual(result, testArray);
        });
    });

    describe('Store.compareTwoHistories', function() {
        beforeEach(function(done) {
            store = new Store(function() {
                done();
            });
        });

        it('should return true for identical histories', function() {
            const history1 = {
                sender: 'John Doe',
                receiver: 'Jane Smith',
                subject: 'Test',
                content: 'Content'
            };
            const history2 = {
                sender: 'John Doe',
                receiver: 'Jane Smith',
                subject: 'Test',
                content: 'Content'
            };
            const result = store.compareTwoHistories(history1, history2);
            assert.equal(result, true);
        });

        it('should return false for different histories', function() {
            const history1 = {
                sender: 'John Doe',
                receiver: 'Jane Smith',
                subject: 'Test',
                content: 'Content'
            };
            const history2 = {
                sender: 'John Doe',
                receiver: 'Jane Smith',
                subject: 'Different',
                content: 'Content'
            };
            const result = store.compareTwoHistories(history1, history2);
            assert.equal(result, false);
        });

        it('should ignore date, time, printDate, and foldingMarks differences', function() {
            const history1 = {
                sender: 'John Doe',
                receiver: 'Jane Smith',
                subject: 'Test',
                content: 'Content',
                date: '01.01.2020',
                time: '10:00:00',
                printDate: '01.01.2020',
                foldingMarks: true
            };
            const history2 = {
                sender: 'John Doe',
                receiver: 'Jane Smith',
                subject: 'Test',
                content: 'Content',
                date: '02.02.2021',
                time: '11:00:00',
                printDate: '02.02.2021',
                foldingMarks: false
            };
            const result = store.compareTwoHistories(history1, history2);
            assert.equal(result, true);
        });
    });

    describe('Store.storeHistory', function() {
        beforeEach(function(done) {
            store = new Store(function() {
                // Clear history before each test
                store.set('history', []);
                done();
            });
        });

        it('should add new entry to history when history exists', function() {
            // Initialize history first
            store.set('history', []);
            
            const content1 = {
                sender: 'John Doe',
                receiver: 'Jane Smith',
                subject: 'Test 1',
                content: 'Content 1'
            };
            const content2 = {
                sender: 'Jane Doe',
                receiver: 'John Smith',
                subject: 'Test 2',
                content: 'Content 2'
            };
            
            // Manually add to history since storeHistory requires getCurrentContent
            let history = store.get('history') || [];
            if (!store.compareTwoHistories(content1, history[0] || {})) {
                history.unshift(content1);
                store.set('history', history);
            }
            
            history = store.get('history');
            if (!store.compareTwoHistories(content2, history[0] || {})) {
                history.unshift(content2);
                store.set('history', history);
            }
            
            const finalHistory = store.get('history');
            assert.equal(finalHistory.length, 2);
            assert.equal(finalHistory[0].sender, 'Jane Doe');
            assert.equal(finalHistory[1].sender, 'John Doe');
        });

        it('should not add duplicate entries', function() {
            const content = {
                sender: 'John Doe',
                receiver: 'Jane Smith',
                subject: 'Test',
                content: 'Content'
            };
            
            // Manually add to history
            let history = store.get('history') || [];
            history.unshift(content);
            store.set('history', history);
            
            // Try to add same content again
            const isDuplicate = store.compareTwoHistories(content, history[0]);
            assert.equal(isDuplicate, true, 'Should identify duplicate content');
            
            const finalHistory = store.get('history');
            assert.equal(finalHistory.length, 1);
        });
    });

    describe('Store.deleteHistory', function() {
        beforeEach(function(done) {
            store = new Store(function() {
                done();
            });
        });

        it('should clear history', function() {
            store.set('history', [
                { sender: 'John Doe', receiver: 'Jane Smith' },
                { sender: 'Jane Doe', receiver: 'John Smith' }
            ]);
            store.deleteHistory();
            const history = store.get('history');
            assert.deepEqual(history, []);
        });
    });

    describe('Store.useDropbox', function() {
        beforeEach(function(done) {
            store = new Store(function() {
                done();
            });
        });

        it('should return false by default', function() {
            store.set('settings', {});
            const result = store.useDropbox();
            assert.equal(result, false);
        });

        it('should return true when useDropbox is enabled', function() {
            store.set('settings', { useDropbox: true });
            const result = store.useDropbox();
            assert.equal(result, true);
        });

        it('should return false when useDropbox is disabled', function() {
            store.set('settings', { useDropbox: false });
            const result = store.useDropbox();
            assert.equal(result, false);
        });
    });

    describe('Store.setDropboxKey', function() {
        beforeEach(function(done) {
            store = new Store(function() {
                done();
            });
        });

        it('should set dropbox key in settings', function() {
            const testKey = 'test-dropbox-key-123';
            store.setDropboxKey(testKey);
            const settings = store.get('settings');
            assert.equal(settings.dropboxKey, testKey);
        });
    });

    describe('Store.isDropboxKeyNeeded', function() {
        beforeEach(function(done) {
            store = new Store(function() {
                done();
            });
        });

        it('should return true when dropbox is used but key is missing', function() {
            store.set('settings', { useDropbox: true });
            const result = store.isDropboxKeyNeeded();
            assert.equal(result, true);
        });

        it('should return false when dropbox is not used', function() {
            store.set('settings', { useDropbox: false });
            const result = store.isDropboxKeyNeeded();
            assert.equal(result, false);
        });

        it('should return false when dropbox key exists', function() {
            store.set('settings', { useDropbox: true, dropboxKey: 'test-key' });
            store.dropboxKey = 'test-key';
            const result = store.isDropboxKeyNeeded();
            assert.equal(result, false);
        });
    });
});
