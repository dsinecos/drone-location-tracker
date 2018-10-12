module.exports = function () {
    const rand = Math.random();
    return Promise.resolve(rand > 0.8);
};
