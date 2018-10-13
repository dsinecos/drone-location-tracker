module.exports = function (onlineProbability = 0.5) {
    const rand = Math.random();
    return Promise.resolve(rand < onlineProbability);
};
