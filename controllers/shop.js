const Product = require('../models/product');
const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
const SubSubCategory = require('../models/sub-sub-category');
const Order = require('../models/order');
const Confirmation = require('../models/confirmation');
const User = require('../models/user');

exports.getIndex = (req, res, next) => {

    Order
        .find()
        .then(orders => {
            return orders;
        })
        .then(orders => {
            User
                .find()
                .then(userNumber => {
                    Confirmation
                        .find()
                        .then(confirm => {
                            return confirm;
                })
                .then(confirm => {
                    Product.find()
                        .then(products => {
                        return products;
                    })
                    .then(products => {
                        Category.find()
                            .then(categories => {
                                SubCategory.find()
                                    .then(subcategories => {
                                        SubSubCategory.find()
                                            .then(subsubcategories => {
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
                                            })
                                    })
                                
                            })
                    })
                    .catch((err) => {
                        next(err);
                    });
                })
            })
        })
}

exports.getProducts = (req, res, next) => {
    Order
        .find()
        .then(orders => {
            return orders;
        })
        .then(orders => {
            User
                .find()
                .then(userNumber => {
                    Confirmation
                        .find()
                        .then(confirm => {
                            return confirm;
                })
                .then(confirm => {
                    Product.find()
                        .then(products => {
                        return products;
                    })
                    .then(products => {
                        SubSubCategory.find()
                            .then(subsubcategories => {
                                SubCategory.find()
                                    .then(subcategories => {
                                        Category.find()
                                            .then(categories => {
                                                res.render('shop/products', {
                                                    title: 'Tüm Ürünler',
                                                    products: products,
                                                    path: '/products',
                                                    categories: categories,
                                                    subcategories: subcategories,
                                                    subsubcategories: subsubcategories,
                                                    confirm: confirm,
                                                    userNumber: userNumber,
                                                    orders: orders
                                                });
                                            })
                                    })   
                            })
                    })
                    .catch((err) => {
                        next(err);
                    });
                })
            })
        })
}

exports.getProductsByCategoryId = (req, res, next) => {
    const categoryid = req.params.subsubcategoryid;
    const model = [];

    SubSubCategory.find()
        .then(categories => {
            model.categories = categories;
            return Product.find({
                categories: categoryid
            });
        })
        .then(products => {
            SubCategory.find()
                .then(subcategories => {
                    Category.find()
                        .then(categories => {
                            res.render('shop/products', {
                            title: 'Kategorilenmiş Ürünler',
                            products: products,
                            categories: categories,
                            subcategories: subcategories,
                            subsubcategories: model.categories,
                            selectedCategory: categoryid,
                            path: '/products'
                            });
                        })
                })
        })
        .catch((err) => {
            next(err);
        })
}

exports.getProduct = (req, res, next) => {

    Product
        .findById(req.params.productid)
        //.findOne({_id:req.params.productid})
        .then(product => {
            SubSubCategory.find()
                .then(subsubcategories => {
                    res.render('shop/product-detail', {
                    title: product.name.toUpperCase(),
                    subsubcategories: subsubcategories,
                    product: product,
                    path: '/products'
                    });
                })

        })
        .catch((err) => {
            next(err);
        });
}

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .execPopulate()
        .then(user => {
            res.render('shop/cart', {
                title: 'Sepet',
                path: '/cart',
                products: user.cart.items
            });
        }).catch(err => {
            next(err);
        });
}

exports.postCart = (req, res, next) => {

    const productId = req.body.productId;
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => next(err));
}

exports.postCartItemDelete = (req, res, next) => {
    const productid = req.body.productid;
    req.user
        .deleteCartItem(productid)
        .then( () => {
            res.redirect('/cart');
        });
    
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

exports.getContact = (req, res, next) => {
    Category.find()
        .then(categories => {
            SubCategory.find()
                .then(subcategories => {
                    SubSubCategory.find()
                        .then(subsubcategories => {
                            res.render('shop/contact', {
                                title: 'İletişim',
                                path: '/contact',
                                categories: categories,
                                subcategories: subcategories,
                                subsubcategories: subsubcategories
                            });
                        })
                })
        })
        .catch((err) => {
            next(err);
        });     
}

/* Search box*/
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

exports.getSearch = (req, res, next) => {
    Order
        .find()
        .then(orders => {
            return orders;
        })
        .then(orders => {
            User
                .find()
                .then(userNumber => {
                    Confirmation
                        .find()
                        .then(confirm => {
                            return confirm;
                })
                .then(confirm => {
                    Product.find()
                        .then(products => {
                        return products;
                    })
                    .then(products => {
                        SubSubCategory.find()
                            .then(subsubcategories => {
                                SubCategory.find()
                                    .then(subcategories => {
                                        Category.find()
                                            .then(categories => {
                                                    if(req.query.search){
                                                        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
                                                        Product.find({ "name": regex }, function(err, foundjobs) {
                                                            if(err) {
                                                                console.log(err);
                                                            } else {
                                                                res.render('shop/products', {
                                                                    title: 'Tüm Ürünler',
                                                                    products: foundjobs,
                                                                    path: '/products',
                                                                    categories: categories,
                                                                    subcategories: subcategories,
                                                                    subsubcategories: foundjobs,
                                                                    confirm: confirm,
                                                                    userNumber: userNumber,
                                                                    orders: orders
                                                                });
                                                    }
                                                });
                                        }
                                
                                            })
                                    })   
                            })
                    })
                    .catch((err) => {
                        next(err);
                    });
                })
            })
        })
}

/* SecondHand Filter*/
exports.getSecondHandFilter = (req, res, next) => {
    Order
        .find()
        .then(orders => {
            return orders;
        })
        .then(orders => {
            User
                .find()
                .then(userNumber => {
                    Confirmation
                        .find()
                        .then(confirm => {
                            return confirm;
                })
                .then(confirm => {
                    Product.find()
                        .then(products => {
                        return products;
                    })
                    .then(products => {
                        SubSubCategory.find()
                            .then(subsubcategories => {
                                SubCategory.find()
                                    .then(subcategories => {
                                        Category.find()
                                            .then(categories => {
                                                    if(req.query.secondHandFilter){
                                                        const regex = (req.query.secondHandFilter);
                                                        Product.find({ "isSecondHand": regex }, function(err, foundjobs) {
                                                            if(err) {
                                                                console.log(err);
                                                            } else {
                                                                res.render('shop/products', {
                                                                    title: 'Tüm Ürünler',
                                                                    products: foundjobs,
                                                                    path: '/products',
                                                                    categories: categories,
                                                                    subcategories: subcategories,
                                                                    subsubcategories: subsubcategories,
                                                                    confirm: confirm,
                                                                    userNumber: userNumber,
                                                                    orders: orders,
                                                                    action: regex
                                                                });
                                                    }
                                                });
                                        }
                                
                                            })
                                    })   
                            })
                    })
                    .catch((err) => {
                        next(err);
                    });
                })
            })
        })
}

/* Price Filter*/
exports.getPrice = (req, res, next) => {
    Order
        .find()
        .then(orders => {
            return orders;
        })
        .then(orders => {
            User
                .find()
                .then(userNumber => {
                    Confirmation
                        .find()
                        .then(confirm => {
                            return confirm;
                })
                .then(confirm => {
                    Product.find()
                        .then(products => {
                        return products;
                    })
                    .then(products => {
                        SubSubCategory.find()
                            .then(subsubcategories => {
                                SubCategory.find()
                                    .then(subcategories => {
                                        Category.find()
                                            .then(categories => {
                                                    if(req.query.minPrice){
                                                        const regex = (req.query.minPrice);
                                                        const regex2 = (req.query.maxPrice);
                                                        Product.find({ "price": {$gt: regex, $lt: regex2} }, function(err, foundjobs) {
                                                            if(err) {
                                                                console.log(err);
                                                            } else {
                                                                res.render('shop/products', {
                                                                    title: 'Tüm Ürünler',
                                                                    products: foundjobs,
                                                                    path: '/products',
                                                                    categories: categories,
                                                                    subcategories: subcategories,
                                                                    subsubcategories: subsubcategories,
                                                                    confirm: confirm,
                                                                    userNumber: userNumber,
                                                                    orders: orders
                                                                });
                                                    }
                                                });
                                        }
                                
                                            })
                                    })   
                            })
                    })
                    .catch((err) => {
                        next(err);
                    });
                })
            })
        })
}