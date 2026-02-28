const assert = require('assert');
const { colorize, buildAddress } = require('../app/js/letterStructureHelpers');

describe('LetterStructure Helper Functions', function() {

    describe('buildAddress', function() {
        it('should return default message for empty address', function() {
            const result = buildAddress([], "Doppelklicken um Empfänger hinzuzufügen");
            assert.equal(result[0], "Doppelklicken um Empfänger hinzuzufügen");
        });

        it('should format name correctly', function() {
            const result = buildAddress(["Herr", "Dr.", "Max", "Mustermann", "", "", "", "", "", ""]);
            assert.equal(result[0], "Herr Dr. Max Mustermann");
        });

        it('should format complete address', function() {
            const result = buildAddress(["Herr", "", "Max", "Mustermann", "Musterfirma GmbH", "IT-Abteilung", "Musterstraße 123", "12345", "Musterstadt", "Deutschland"]);
            assert.equal(result[0], "Herr Max Mustermann");
            assert.equal(result[1], "Musterfirma GmbH");
            assert.equal(result[2], "IT-Abteilung");
            assert.equal(result[3], "Musterstraße 123");
            assert.equal(result[4], "12345 Musterstadt");
            assert.equal(result[5], "Deutschland");
        });

        it('should handle empty name fields', function() {
            const result = buildAddress(["", "", "", "", "Musterfirma GmbH", "", "Musterstraße 123", "12345", "Musterstadt", ""]);
            assert.equal(result[0], "Musterfirma GmbH");
            assert.equal(result[1], "Musterstraße 123");
            assert.equal(result[2], "12345 Musterstadt");
        });
    });

    describe('colorize', function() {
        it('should return a valid hex color', function() {
            const color = colorize("test string");
            assert.ok(/^#[0-9a-f]{6}$/i.test(color));
        });

        it('should return consistent colors for same input', function() {
            const color1 = colorize("test");
            const color2 = colorize("test");
            assert.equal(color1, color2);
        });

        it('should return different colors for different inputs', function() {
            const color1 = colorize("test1");
            const color2 = colorize("test2");
            assert.notEqual(color1, color2);
        });
    });
});

