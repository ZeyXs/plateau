const User = require("../models/User");

const getBaseLog = (x, y) => {
    // renvoie logx(y)
    return Math.log(y) / Math.log(x);
}

const xpFormula = (x) => { return 0.5 * Math.exp(getBaseLog(5, x)); }

const getLevelFromXP = (xp) => {
    return Math.floor(xpFormula(xp));
}

const getXPFromLevel = (level) => {
    return Math.pow(5, Math.log(2*level));
}

const addXpTo = async (userId, xp) => {
    const user = await User.findOneAndUpdate({ _id: userId }, { $inc: { xp: xp } });
    const initialXP = user.xp; const initalLevel = getLevelFromXP(initialXP);
    const newXP = initialXP + xp; const newLevel = getLevelFromXP(newXP);
    if(initalLevel != newLevel) return [true, newLevel];
    return [false, initalLevel];
}

module.exports = { getLevelFromXP, getXPFromLevel, addXpTo };