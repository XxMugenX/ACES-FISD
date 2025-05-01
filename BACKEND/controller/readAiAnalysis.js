const data = require('../AI_MODEL/data.json')

//gets data showing requirement which leads to better yield for a crop
const readAiAnalysis = (fruitId) => {
    return data[fruitId] 
}

module.exports = readAiAnalysis
