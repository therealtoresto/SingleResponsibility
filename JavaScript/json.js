'use strict';

module.exports = class JsonParser {
    constructor() {
        this.name = 'json';
    }

    parse(data) {
        return JSON.parse(data);
    }

    serialize(obj) {
        return JSON.stringify(obj);
    }
};