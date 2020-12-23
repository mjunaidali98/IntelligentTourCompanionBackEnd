var mongoose = require('mongoose');
var schema = mongoose.Schema;
var tag = new schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    }
});
module.exports = mongoose.model('Tag', tag);
