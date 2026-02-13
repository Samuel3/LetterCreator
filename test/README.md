# Tests für LetterCreator

Dieses Verzeichnis enthält die Test-Suite für die LetterCreator-Anwendung.

## Test-Struktur

- `spec.js` - End-to-End Tests mit Spectron (Electron-App Tests)
- `store.test.js` - Unit-Tests für die Store-Klasse (Datenpersistenz)
- `letter.test.js` - Unit-Tests für die Letter-Klasse
- `letterStructure.test.js` - Unit-Tests für Hilfsfunktionen der Briefstruktur
- `i18n.test.js` - Unit-Tests für Internationalisierung und Sprachdateien

## Tests ausführen

### Alle Tests ausführen
```bash
npm test
```

### Nur Unit-Tests ausführen
```bash
npm run test:unit
```

### Nur End-to-End Tests ausführen
```bash
npm run test:e2e
```

## Test-Abdeckung

Die Tests decken folgende Bereiche ab:

### Store.js
- ✅ Initialisierung
- ✅ get() und set() Methoden
- ✅ History-Verwaltung (storeHistory, deleteHistory)
- ✅ Vergleich von Historie-Einträgen (compareTwoHistories)
- ✅ Dropbox-Integration (useDropbox, setDropboxKey, isDropboxKeyNeeded)

### Letter.js
- ✅ Konstruktor
- ✅ Content-Verwaltung
- ✅ toWord() Methode (vorbereitet für zukünftige Implementierung)

### LetterStructure.js
- ✅ getAddress() - Adressformatierung
- ✅ getCurrentContent() - Briefinhalt-Struktur
- ✅ colorize() - Farbgenerierung für Historie

### i18n.js
- ✅ Sprachdateien-Laden
- ✅ Schlüssel-Konsistenz zwischen Sprachen
- ✅ Vollständigkeit der Übersetzungen

## Hinweise

- Die Store-Tests verwenden Mocking für Electron-Module und Dropbox
- Die E2E-Tests benötigen eine laufende Electron-Instanz
- Einige Tests können länger dauern (insbesondere E2E-Tests mit Timeout von 5 Minuten)
