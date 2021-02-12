let mongoose = require('mongoose');

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
});
//var messageContent = db.model('messageContent', whatsappSchema);

module.exports = mongoose.model('messagecontent', whatsappSchema);
//export default mongoose.model('messageContent', whatsappSchema);