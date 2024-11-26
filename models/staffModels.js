const { Schema, default: mongoose } = require("mongoose");

const staffSchema = new Schema({
    userId: { 
        type: String, 
        unique: true, 
        required: true 
    },
    postalCode: { 
        type: String, 
        required: true 
    },
    fullName: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
}, { timestamps: true });

module.exports = mongoose.model('Staff', staffSchema);
