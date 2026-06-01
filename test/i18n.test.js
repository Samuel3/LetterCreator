const assert = require('assert');
const path = require('path');

describe('i18n', function() {
    let i18n;
    let deLang;
    let enLang;

    beforeEach(function() {
        // Load language files
        deLang = require('../app/i18n/de.json');
        enLang = require('../app/i18n/en.json');
    });

    describe('Language files', function() {
        it('should load German language file', function() {
            assert.ok(deLang);
            assert.equal(typeof deLang, 'object');
        });

        it('should load English language file', function() {
            assert.ok(enLang);
            assert.equal(typeof enLang, 'object');
        });

        it('should have same number of keys in both language files', function() {
            const deKeys = Object.keys(deLang);
            const enKeys = Object.keys(enLang);
            assert.equal(deKeys.length, enKeys.length, 
                `German has ${deKeys.length} keys, English has ${enKeys.length} keys`);
        });

        it('should have matching keys in both language files', function() {
            const deKeys = Object.keys(deLang).sort();
            const enKeys = Object.keys(enLang).sort();
            assert.deepEqual(deKeys, enKeys, 'Keys do not match between language files');
        });
    });

    describe('Translation keys', function() {
        it('should have all menu keys', function() {
            const requiredKeys = [
                'menu.file',
                'menu.edit',
                'menu.view',
                'menu.window',
                'menu.help'
            ];
            requiredKeys.forEach(key => {
                assert.ok(deLang[key], `Missing key: ${key} in German`);
                assert.ok(enLang[key], `Missing key: ${key} in English`);
            });
        });

        it('should have all message keys', function() {
            const requiredKeys = [
                'message.letterstored',
                'message.addsender',
                'message.chooselang',
                'message.stored',
                'message.historydeleted'
            ];
            requiredKeys.forEach(key => {
                assert.ok(deLang[key], `Missing key: ${key} in German`);
                assert.ok(enLang[key], `Missing key: ${key} in English`);
            });
        });

        it('should have all button keys', function() {
            const requiredKeys = [
                'button.ok',
                'button.abort',
                'button.delete',
                'button.further',
                'button.back'
            ];
            requiredKeys.forEach(key => {
                assert.ok(deLang[key], `Missing key: ${key} in German`);
                assert.ok(enLang[key], `Missing key: ${key} in English`);
            });
        });

        it('should have all letter keys', function() {
            const requiredKeys = [
                'letter.subject',
                'letter.greeting',
                'letter.place',
                'letter.content'
            ];
            requiredKeys.forEach(key => {
                assert.ok(deLang[key], `Missing key: ${key} in German`);
                assert.ok(enLang[key], `Missing key: ${key} in English`);
            });
        });
    });

    describe('Translation values', function() {
        it('should have non-empty translations', function() {
            Object.keys(deLang).forEach(key => {
                assert.ok(deLang[key], `Empty translation for key: ${key} in German`);
                assert.ok(enLang[key], `Empty translation for key: ${key} in English`);
            });
        });

        it('should have different translations for different languages', function() {
            // Most keys should have different translations
            const differentKeys = Object.keys(deLang).filter(key => 
                deLang[key] !== enLang[key]
            );
            // At least 80% of keys should be different
            assert.ok(differentKeys.length > Object.keys(deLang).length * 0.8,
                'Too many identical translations between languages');
        });
    });

    describe('i18n function mock', function() {
        it('should return translation for existing key', function() {
            // Mock i18n function
            const mockI18n = function(key) {
                return deLang[key] || key;
            };
            const result = mockI18n('button.ok');
            assert.equal(result, 'OK');
        });

        it('should return key if translation not found', function() {
            const mockI18n = function(key) {
                return deLang[key] || key;
            };
            const result = mockI18n('nonexistent.key');
            assert.equal(result, 'nonexistent.key');
        });
    });
});
