const mongoose = require('mongoose');

const subsubcategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            required: true
        }
    ]
});

module.exports = mongoose.model('Subsubcategory', subsubcategorySchema);