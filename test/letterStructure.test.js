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

    describe('getCurrentContent structure', function() {
        // Mock implementation
        function getCurrentContent(mockData) {
            return {
                place: mockData.place || "Ort, den ",
                sender: mockData.sender || "",
                receiver: mockData.receiver || "",
                subject: mockData.subject || "Betreff: Ihr Schreiben vom",
                content: mockData.content || "Sehr geehrter Herr <br><br>Lorem Ipsum",
                greeting: mockData.greeting || "Grüße<br><br>Absender",
                foldingMarks: mockData.foldingMarks || false,
                date: mockData.date || new Date().toLocaleDateString('de-DE'),
                time: mockData.time || new Date().toLocaleTimeString(),
                printDate: mockData.printDate || new Date().toLocaleDateString(),
                "version": "1.0"
            };
        }

        it('should return content object with all required fields', function() {
            const mockData = {
                place: "Berlin, den",
                sender: "Max Mustermann",
                receiver: "Jane Doe",
                subject: "Test Subject",
                content: "Test Content",
                greeting: "Mit freundlichen Grüßen",
                foldingMarks: true,
                date: "01.01.2020",
                time: "10:00:00",
                printDate: "01.01.2020"
            };
            const result = getCurrentContent(mockData);
            assert.equal(result.place, "Berlin, den");
            assert.equal(result.sender, "Max Mustermann");
            assert.equal(result.receiver, "Jane Doe");
            assert.equal(result.subject, "Test Subject");
            assert.equal(result.content, "Test Content");
            assert.equal(result.greeting, "Mit freundlichen Grüßen");
            assert.equal(result.foldingMarks, true);
            assert.equal(result.date, "01.01.2020");
            assert.equal(result.version, "1.0");
        });

        it('should use default values when fields are missing', function() {
            const result = getCurrentContent({});
            assert.ok(result.place);
            assert.ok(result.subject);
            assert.ok(result.content);
            assert.ok(result.greeting);
            assert.equal(result.version, "1.0");
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

