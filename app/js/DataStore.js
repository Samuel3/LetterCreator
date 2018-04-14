class DataStore {

    store;

    constructor(){
        this.store = require('data-store')('letterCreator');
    }

    getStoredData = function (key) {
        return this.store.get(key)
    };

    setStoredData = function (key, value) {
        this.store.set(key, value);
        this.store.save();
    };
}

//# sourceURL=DataStore.js