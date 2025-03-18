
const mongoose = require('mongoose');

const TaskChangeHistorySchema = new mongoose.Schema(
    {
        taskChangeId: { type : mongoose.Schema.Types.ObjectId , ref:'Task' , require:true}, 
        statusChangeTo : { type: String , require:true},
        changeBy : {type:String , require:true},
        lastUpdated: { type: Date, default: Date.now }
    }
)

module.exports = mongoose.model('TaskChangeHistory' , TaskChangeHistorySchema);