/**
 * @returns {string}
 */
String.prototype.capitalize = function() {
    if(this.length === 0) return this;
    if(this.length === 1) return this.toUpperCase();

    return this.charAt(0).toUpperCase() + this.slice(1);
};

/**
 * @returns {*}
 */
Array.prototype.first = function() {
    let keys = Object.keys(this);

    if(keys.length === 0) return undefined;

    return this[keys[0]];
};