const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Ürün ismi girmelisiniz.'],
        maxlength: [30, 'Ürün ismi için en fazla 255 karakter girebilirsiniz.'],
        uppercase: true, //büyük küçük olması
        trim: true // boşluk karakterini alır
    },
    price: {
        type: Number,
        required: [true, 'Lütfen fiyat bilgisini giriniz.'],
        min: 0,
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String
    },
    nameOfSeller: {
        type: String
    },
    phoneOfSeller: {
        type: String
    },
    mailOfSeller: {
        type: String
    },
    isSecondHand: {
        type: String
    },
    city: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
        
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subsubcategory',
            required: false
        }
    ]
});

module.exports = mongoose.model('Product', productSchema);