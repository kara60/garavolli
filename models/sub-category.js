const mongoose = require('mongoose');

const subcategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        }
    ]
});

module.exports = mongoose.model('Subcategory', subcategorySchema);