const Product = require('../models/product');
const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
const SubSubCategory = require('../models/sub-sub-category');
const Order = require('../models/order');
const Confirmation = require('../models/confirmation');
const User = require('../models/user');
const nodemailer = require("nodemailer");

exports.getIndex = async (req, res, next) => {
    try{
        const orders = await Order.find();
        const userNumber = await User.find();
        const confirm = await Confirmation.find();
        const products = await Product.find();
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const subsubcategories = await SubSubCategory.find();

        res.render('shop/index', {
            title: 'Garavolli',
            products: products,
            path: '/',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories,
            confirm: confirm,
            userNumber: userNumber,
            orders: orders,
            user: req.user
        });
    }
    catch(err){
        next(err);
    }
}

exports.getProductsByCategoryId = async (req, res, next) => {
    try{
        const categoryid = req.params.subsubcategoryid;
        const model = [];

        const subsubcategories = await SubSubCategory.find();
        model.subsubcategories = subsubcategories;
        const products = await Product.find({ categories: categoryid });
        
        const subcategories = await SubCategory.find();
        const categories = await Category.find();
        
        res.render('shop/products', {
            title: 'Kategorilenmiş Ürünler',
            products: products,
            path: '/products',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: model.subsubcategories,
            selectedCategory: categoryid, 
            inputs:{
                takeSecondHand: '',
                takeMinPrice: '',
                takeMaxPrice: ''
            }
            });
    }   
    catch(err){
        next(err);
    }
}

exports.getProduct = async (req, res, next) => {
    try{
        const product = await Product.findById(req.params.productid);
        const subsubcategories = await SubSubCategory.find();
        const subcategories = await SubCategory.find();
        const categories = await Category.find();

        res.render('shop/product-detail', {
            title: product.name.toUpperCase(),
            subsubcategories: subsubcategories,
            subcategories:subcategories,
            categories:categories,
            product: product,
            path: '/products'
            });
    }
    catch(err){
        next(err);
    }
}

exports.getCart = async (req, res, next) => {
    try{
        req.user
        const user = await populate('cart.items.productId').execPopulate()
        
        res.render('shop/cart', {
            title: 'Sepet',
            path: '/cart',
            products: user.cart.items
        });
    }
    catch(err){
        next(err);
    }
}

exports.postCart = async (req, res, next) => {
    try{
        const productId = req.body.productId;

        const product = await Product.findById(productId);

        req.user.addToCart(product);

        res.redirect('/cart');
    }
    catch(err){
        next(err);
    }
}

exports.postCartItemDelete = async (req, res, next) => {
    try{
        const productid = req.body.productid;
        req.user.deleteCartItem(productid);

        res.redirect('/cart');
    }
    catch(err){
        next(err);
    }
    
    // const productid = req.body.productid;
    
    // //User.updateMany({"cart.items.productId": productid}, {"cart.items": []}) /* Birşey silindiği zaman bütün sepetleri boşaltıyor */
    // User.find({"cart.items.productId": productid}) /* Tıklanan ürünün kimlerde olduğunu buluyor */
    //     .then(result => {
    //         const len = result.length;
    //         for(var i=0; i<len; i++) {
    //             for(var j=0; j<len; j++){
    //                 if(result[i].cart.items[j].productId == productid){
    //                     const deleteId = result[i].cart.items[j]._id;

    //                     User.updateMany({"cart.items.productId": productid},{"cart.items": []})
    //                 }else{
    //                     console.log("pas");
    //                 }
    //             }
                
    //         }
    //         res.redirect('/cart');
    //     })
    //     .catch(err => next(err));
}       

exports.getOrders = (req, res, next) => {
    Order
        .find({'user.userId': req.user._id})
        .then(orders => {
            res.render('shop/orders', {
                title: 'Siparişler',
                path: '/orders',
                orders: orders
            });
        })
        .catch(err => {
            next(err);
        });
}

exports.postOrder = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            const order =  new Order({
                user: {
                    userId: req.user._id,
                    name: req.user.name,
                    email: req.user.email
                },
                items: user.cart.items.map(p => {
                    return {
                        product: {
                            _id: p.productId._id,
                            name: p.productId.name,
                            price: p.productId.price,
                            imageUrl: p.productId.imageUrl
                        },
                        quantity: p.quantity
                    };
                })
            });
            return order.save();
        })
        .then(() => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders')
        })
        .catch(err => {
            next(err);
        })
}


// exports.getContact = (req, res, next) => {

//     res.render('shop/contact', {
//         title: 'İletişim',
//         path: '/contact'
//     });

// }

exports.getContact = async (req, res, next) => {
    try{
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const subsubcategories = await SubSubCategory.find();

        res.render('shop/contact', {
            title: 'İletişim',
            path: '/contact',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories,
            action: req.query.action
        });
    }
    catch(err){
        next(err);
    }
}

exports.postContact = async (req, res, next) => {
    try{
        const name = req.body.name;
        const subject = req.body.subject;
        const message = req.body.message;

        //mail gönderme
        const transfer = nodemailer.createTransport({
            service: "gmail", //maili gönderen kişinin kullandığı servis
            auth:{ // maili gönderen kişinin bilgileri
                user:"garavollishopping@gmail.com",
                pass:"enekcanel"
            }
        });

        let mailBilgi = {
            from: "garavollishopping@gmail.com",
            to:"garavollishopping@gmail.com",
            subject: subject,
            html: 
            `
                <h3>İsim: ${name}</h3>
                <br>
                <p>${message}</p>
            `
        };

        transfer.sendMail(mailBilgi, err => {
            if(err){
                next(err);
            }
            else{
                return res.redirect('/contact?action=success');
            }
        });

        return res.redirect('/contact?action=success');
    }
    catch(err){
        next(err);
    }
}

/* Search box*/
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.getSearch = async (req, res, next) => {
    try{
        const subsubcategories = await SubSubCategory.find();
        const subcategories = await SubCategory.find();
        const categories = await Category.find();
        
        if(req.query.search){
            var searchRegex = new RegExp(escapeRegex(req.query.search), 'gi');
        }

        const subsubcategoriesProduct = await SubSubCategory.find({ "name": searchRegex}, '_id')

        const ids = subsubcategoriesProduct.map(s => s._id);

        const finalProduct = await Product.find({ categories: {$in: ids} });

        res.render('shop/products', {
            title: 'Tüm Ürünler',
            products: finalProduct,
            path: '/products',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories,
            searchRegex: searchRegex,
            inputs:{
                takeSecondHand: '',
                takeMinPrice: '',
                takeMaxPrice: ''
            }
        });
    }
    catch(err){
        next(err);
    }
}

/* SecondHand Filter*/
exports.getSecondHandFilter = async (req, res, next) => {
    try{
        const categoryid = req.params.subsubcategoryid;
        const model = [];
        const regex = req.query.secondHandFilter;

        const subsubcategories = await SubSubCategory.find();
        model.subsubcategories = subsubcategories;
        
        const products = await Product.find({ categories: categoryid, "isSecondHand": regex });
        const subcategories = await SubCategory.find();
        const categories = await Category.find();

        res.render('shop/products', {
            title: 'Kategorilenmiş Ürünler',
            products: products,
            path: '/products',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: model.subsubcategories,
            selectedCategory: categoryid,
            action: regex,
            inputs:{
                takeSecondHand: regex,
                takeMinPrice: '',
                takeMaxPrice: ''
            }
            });
    }
    catch(err){
        next(err);
    }
}

/* Price Filter*/
exports.getPrice  = async (req, res, next) => {
    try{
        const categoryid = req.params.subsubcategoryid;
        const model = [];
        const regex = Number((req.query.minPrice));
        const regex2 = Number((req.query.maxPrice));

        const subsubcategories = await SubSubCategory.find();
        model.subsubcategories = subsubcategories;

        const products = await Product.find({ categories: categoryid, "price": {$gt: regex-1, $lt: regex2+1} });
        const subcategories = await SubCategory.find();
        const categories = await Category.find();

        res.render('shop/products', {
            title: 'Kategorilenmiş Ürünler',
            products: products,
            path: '/products',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: model.subsubcategories,
            selectedCategory: categoryid,
            action: regex,
            inputs:{
                takeSecondHand: '',
                takeMinPrice: regex,
                takeMaxPrice: regex2
            }
            });
    }
    catch(err){
        next(err);
    }
}
