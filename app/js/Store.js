function Store() {
    this.store = require('data-store')('LetterCreator');
}

Store.prototype.getStoredData = function (key) {
    return store.get(key);
};

Store.prototype.storeData = function (key, value) {
    store.set(key, value);
};

//# sourceURL=Store.js