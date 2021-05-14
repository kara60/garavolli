const Product = require('../models/product');
const User = require('../models/user');
const Confirmation = require('../models/confirmation');
const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
const SubSubCategory = require('../models/sub-sub-category');
const fs = require('fs');

// exports.getProducts = (req, res, next) => {
//     Product
//         .find({userId: req.user._id})
//         .populate('userId', 'name -_id')
//         .select('name price imageUrl userId')
//         .then(products => {
//             res.render('admin/products', {
//                 title: 'Ürünlerim',
//                 products: products,
//                 path: '/admin/products',
//                 action: req.query.action
//             });
//         })
//         .catch((err) => {
//             next(err);
//         });
// }


exports.getProducts = (req, res, next) => {
    Product
        .find({userId: req.user._id})
        .populate('userId', 'name -_id')
        .select('name price imageUrl userId')
        .then(products => {
            Category.find()
                .then(categories => {
                    SubCategory.find()
                        .then(subcategories => {
                            SubSubCategory.find()
                                .then(subsubcategories => {
                                    res.render('admin/products', {
                                        title: 'Ürünlerim',
                                        products: products,
                                        path: '/admin/products',
                                        action: req.query.action,
                                        categories: categories,
                                        subcategories: subcategories,
                                        subsubcategories: subsubcategories
                                    });
                        })
                })
        })})
        .catch((err) => {
            next(err);
        });     
        
}


exports.getChooseCategory = (req, res, next) => {
    Category.find()
        .then(categories => {
            res.render('admin/choose-category', {
                title: 'Ana Kategori Seç',
                path: '/admin/choose-category',
                categories: categories
            })
        })
}

exports.getChooseSubCategory = (req, res, next) => {
    const categoryid = req.params.categoryid;
    const model = [];

    Category.find()
        .then(categories => {
            model.categories = categories;
            return SubCategory.find({
                categories: categoryid   
            });
        })
        .then(subCategories => {
            res.render('admin/choose-sub-category', {
                title: 'Ürünler',
                categories: subCategories,
                selectedCategory: categoryid,
                path: '/admin/choose-sub-category',
                action: req.query.action
            });
        })
        .catch((err) => {
            next(err);
        })
}



exports.getChooseSubSubCategory = (req, res, next) => {
    const categoryid = req.params.categoryid;
    const model = [];
    
    SubCategory.find()
        .then(categories => {
            model.categories = categories;
            return SubSubCategory.find({
                categories: categoryid
            });
        })
        .then(subsubCategories => {
            res.render('admin/choose-sub-sub-category', {
                title: 'Ürünler',
                categories: subsubCategories,
                selectedCategory: categoryid,
                path: '/admin/choose-sub-sub-category',
                action: req.query.action
            });
        })
        .catch((err) => {
            next(err);
        })
}

exports.getAddProduct = (req, res, next) => {
    const categoryid = req.params.categoryid;
    const model = [];

    SubSubCategory.find()

        .then(subsubCategories => {
            res.render('admin/add-product', {
                title: 'Yeni Ürün Ekleme',
                categories: subsubCategories,
                selectedCategory: categoryid,
                path: '/admin/add-product',
                action: req.query.action,
                inputs:{
                    name: '',
                    price: '',
                    description: '',
                    nameOfSeller: '',
                    phoneOfSeller: '',
                    mailOfSeller: ''
                }
            });
        })
        .catch((err) => {
            next(err);
        })
}

/*
exports.getAddProduct = (req, res, next) => {
    res.render('admin/add-product', {
        title: 'Yeni Ürün Ekleme',
        path: '/admin/add-product',
        inputs:{
            name: '',
            price: '',
            description: '' 
        }
    });
}*/

exports.postAddProduct = (req, res, next) => {
    
    const name = req.body.name;
    const price = req.body.price;
    const image = req.file;
    const description = req.body.description;
    const nameOfSeller = req.body.nameOfSeller;
    const phoneOfSeller = req.body.phoneOfSeller;
    const mailOfSeller = req.body.mailOfSeller;
    const categoryid = req.body.categoryids;
    const isSecondHand = req.body.isSecondHand;
    const city = req.body.city;

    if(!image){
        return res.render('admin/add-product', {
            title: 'Yeni Ürün Ekleme',
            path: '/admin/add-product',
            errorMessage: 'Lütfen bir resim seçiniz.',
            inputs:{
                name: name,
                price: price,
                description: description,
                categories: categoryid,
                nameOfSeller: nameOfSeller,
                phoneOfSeller: phoneOfSeller,
                mailOfSeller: mailOfSeller,
                isSecondHand: isSecondHand,
                city: city
            }
        });
    }

    const confirm = new Confirmation(
        {
            name: name,
            price: price,
            imageUrl: image.filename,
            description: description,
            nameOfSeller: nameOfSeller,
            phoneOfSeller: phoneOfSeller,
            mailOfSeller: mailOfSeller,
            userId: req.user,
            categories: categoryid,
            isSecondHand: isSecondHand,
            city: city
        }
    );

    confirm.save()
        .then(result => {
            res.redirect('/admin/products?action=waiting');
        })
        .catch(err => {
            
            if(err.name == 'ValidationError'){
                let message = '';
                for(field in err.errors){
                    message += err.errors[field].message + '<br>';
                }

                res.render('admin/add-product', {
                    title: 'Yeni Ürün Ekleme',
                    path: '/admin/add-product',
                    errorMessage: message,
                    inputs:{
                        name: name,
                        price: price,
                        description: description,
                        nameOfSeller: nameOfSeller,
                        phoneOfSeller: phoneOfSeller,
                        mailOfSeller: mailOfSeller,
                        categories: categoryid,
                        isSecondHand: isSecondHand,
                        city: city
                    }
                });
            }else{
                //res.redirect('/500');
                next(err);
            }
        });
}

// exports.getEditProduct = (req, res, next) => {

//     Product.findOne({_id: req.params.productid, userId:req.user._id})
//         .then(product => {
//             if(!product){
//                 return res.redirect('/');
//             }
//             return product;
//         })
//         .then(product => {
            
         

//             res.render('admin/edit-product', {
//                 title: 'Ürün Düzenleme',
//                 path: '/admin/products',
//                 product: product,
//             });
//         })      
//         .catch(err => { next(err); });
// }

exports.getEditProduct= (req, res, next) => {
    Product
        .findOne({_id: req.params.productid, userId:req.user._id})
        .then(confirm => {
            if(!confirm){
                return res.redirect('/');
            }
            return confirm;
        })
        .then(confirm => {

            SubSubCategory.find()
                .then(categories => {

                    categories = categories.map(category => {

                        if(confirm.categories){
                            confirm.categories.find(item => {
                                if(item.toString() === category._id.toString()){
                                    category.selected = true;
                                }
                            })
                        }
                        return category;
                    })

                    res.render('admin/edit-product', {
                        title: 'Ürün İnceleme-Onaylama',
                        path: '/admin/products',
                        product: confirm,
                        categories: categories
                    });
                })
        })
        .catch(err => { next(err); });

}

// exports.postEditProduct = (req, res, next) => {

//     const id = req.body.id;
//     const name = req.body.name;
//     const price = req.body.price;
//     const image = req.body.image;
//     //const image = req.file;
//     const isSecondHand = req.body.isSecondHand;
//     const description = req.body.description;
//     const ids = req.body.categoryids;
//     const nameOfSeller = req.body.nameOfSeller;
//     const phoneOfSeller = req.body.phoneOfSeller;
//     const mailOfSeller = req.body.mailOfSeller;
//     const userid = req.body.userid;

//     Product.findOne({_id:id, userId:req.user._id})
//         .then(product => {
//             if(!product){
//                 return res.redirect('/');
//             }
//             product.name = name;
//             product.price = price;
//             product.description = description;
//             product.isSecondHand = isSecondHand;
//             product.nameOfSeller = nameOfSeller;
//             product.phoneOfSeller = phoneOfSeller;
//             product.mailOfSeller = mailOfSeller;
        
//             return product.save();
//         }).then(result => {
//             res.redirect('/admin/products?action=edit');
//         }).catch(err => {
//             next(err);
//         });
// }

exports.postEditProduct = (req, res, next) => {

    const name = req.body.name; 
    const price = req.body.price;
    const image = req.body.image;
    const description = req.body.description;
    const nameOfSeller = req.body.nameOfSeller;
    const phoneOfSeller = req.body.phoneOfSeller;
    const mailOfSeller = req.body.mailOfSeller;
    const ids = req.body.categoryids;
    const userid = req.body.userid;
    const isSecondHand = req.body.isSecondHand;

        const confirm = new Confirmation(
            {
                name: name,
                price: price,
                imageUrl: image,
                description: description,
                nameOfSeller: nameOfSeller,
                phoneOfSeller: phoneOfSeller,
                mailOfSeller: mailOfSeller,
                userId: req.user,
                categories: ids,
                isSecondHand: isSecondHand
            }
        );
         
        confirm.save()
            .then(result => {
                res.redirect('/admin/products?action=edit');
            })
            .catch(err => {
                
                if(err.name == 'ValidationError'){
                    let message = '';
                    for(field in err.errors){
                        message += err.errors[field].message + '<br>';
                    }
    
                    res.render('admin/add-product', {
                        title: 'Yeni Ürün Ekleme',
                        path: '/admin/add-product',
                        errorMessage: message,
                        inputs:{
                            name: name,
                            price: price,
                            description: description
                        }
                    });
                }else{
                    //res.redirect('/500');
                    next(err);
                }
            });
        // Silme işlemi
        const id = req.body.id;
        Product.findOne({_id: id})
        .then(product => {
            if(!product){
                return next(new Error('Silinmek istenen ürün bulunamadı.'));
            }

            return Product.deleteOne({_id: id})
        })
        .catch(err => {
            next(err);
        });
}

exports.postDeleteProduct = (req, res, next) => {
    const id = req.body.productid;
    
    Product.findOne({_id: id, userId: req.user._id})
        .then(product => {
            if(!product){
                return next(new Error('Silinmek istenen ürün bulunamadı.'));
            }   
            fs.unlink('public/img/' + product.imageUrl, err => {
                if(err){
                    console.log(err);
                }
            });

            return Product.deleteOne({_id: id, userId: req.user._id})

        }).then((result) => {
            if(result.deletedCount === 0){
                return next(new Error('Silinmek istenen ürün bulunamadı.'));
            }
            
            res.redirect('/admin/products?action=delete');
        })
        .catch(err => {
            next(err);
        });
}

exports.getAddCategory = (req, res, next) => {
    res.render('admin/add-category', {
        title: 'Yeni Ana Kategori',
        path: '/admin/add-category'
    });
}

exports.postAddCategory = (req, res, next) => {

    const name = req.body.name;
    const description = req.body.description;

    const category = new Category({
        name: name,
        description: description
    });

    category.save()
        .then(result => {
            res.redirect('/admin/categories?action=create');
        })
        .catch(err => {
            next(err);
        });
}

exports.getAddSubCategory = (req, res, next) => {
    Category.find()
    .then(categories => {
        res.render('admin/add-sub-category', {
            title: 'Alt Kategori Ekle',
            path: '/admin/add-sub-category',
            categories: categories
        });
    })
}

exports.postAddSubCategory = (req, res, next) => {

    const name = req.body.name;
    const description = req.body.description;
    const ids = req.body.categoryids;

    const category = new SubCategory({
        name: name,
        description: description,
        categories: ids
    });

    category.save()
        .then(result => {
            res.redirect('/admin/categories?action=createSub');
        })
        .catch(err => {
            next(err);
        });
}

exports.getAddSubSubCategory = (req, res, next) => {
    Category.find()
    .then(categories => {
        res.render('admin/add-sub-sub-category-1', {
            title: 'Alt Kategori Ekle',
            path: '/admin/add-sub-sub-category-1',
            categories: categories
        });
    })
}

exports.getAddSubSubCategory2 = (req, res, next) => {
    const categoryid = req.params.categoryid;
    const model = [];

    Category.find()
    .then(categories => {
        model.categories = categories;
        return SubCategory.find({
            categories: categoryid
        });
    })
    .then(subCatagories => {
        res.render('admin/add-sub-sub-category-2', {
        title: 'Alt Kategori Ekle',
        path: '/admin/add-sub-sub-category-2',
        categories: subCatagories
        });
    })
}

exports.postAddSubSubCategory2 = (req, res, next) => {

    const name = req.body.name;
    const description = req.body.description;
    const ids = req.body.categoryids;

    const category = new SubSubCategory({
        name: name,
        description: description,
        categories: ids
    });

    category.save()
        .then(result => {
            res.redirect('/admin/categories?action=createSubSub');
        })
        .catch(err => {
            next(err);
        });
}

exports.getCategories = (req, res, next) => {

    Category.find()
        .then(categories => {
            res.render('admin/categories', {
                title: 'Kategoriler',
                path: '/admin/categories',
                categories: categories,
                action: req.query.action
            });
        }).catch(err => next(err));
}

exports.getSubCategories = (req, res, next) => {
    const categoryid = req.params.categoryid;
    const model = [];

    Category.find()
        .then(categories => {
            model.categories = categories;
            return SubCategory.find({
                categories: categoryid
            });
        })
        .then(subCategories => {
            res.render('admin/subCategories', {
                title: 'Ürünler',
                categories: subCategories,
                selectedCategory: categoryid,
                path: '/admin/subCategories',
                action: req.query.action
            });
        })
        .catch((err) => {
            next(err);
        })
}

exports.getSubSubCategories = (req, res, next) => {
    const categoryid = req.params.categoryid;
    const model = [];

    SubCategory.find()
        .then(categories => {
            model.categories = categories;
            return SubSubCategory.find({
                categories: categoryid
            });
        })
        .then(subCategories => {
            res.render('admin/subsubCategories', {
                title: 'Ürünler',
                categories: subCategories,
                selectedCategory: categoryid,
                path: '/admin/subCategories',
                action: req.query.action
            });
        })
        .catch((err) => {
            next(err);
        })
}

exports.getEditSubCategory = (req, res, next) => {
    SubCategory.findById(req.params.categoryid)
        .then(category => {
            res.render('admin/edit-sub-category', {
                title: 'Alt Kategori Düzenleme',
                path: '/admin/subCategories',
                category: category
            })
        })
        .catch(err => next(err));
}

exports.getEditSubSubCategory = (req, res, next) => {
    SubSubCategory.findById(req.params.categoryid)
        .then(category => {
            res.render('admin/edit-sub-sub-category', {
                title: 'En Alt Kategori Düzenleme',
                path: '/admin/subsubCategories',
                category: category
            })
        })
        .catch(err => next(err));
}

exports.getEditCategory = (req, res, next) => {
    Category.findById(req.params.categoryid)
        .then(category => {
            res.render('admin/edit-category', {
                title: 'Kategori Düzenleme',
                path: '/admin/categories',
                category: category
            })
        })
        .catch(err => next(err));
}

exports.postEditSubCategory = (req, res, next) => {

    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;

    SubCategory.findById(id)
        .then(category => {
            category.name = name;
            category.description = description;
            return category.save();
        }).then(() => {
            res.redirect('/admin/Categories?action=editSub'); 
        })
        .catch(err => next(err));
}

exports.postEditSubSubCategory = (req, res, next) => {

    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;

    SubSubCategory.findById(id)
        .then(category => {
            category.name = name;
            category.description = description;
            return category.save();
        }).then(() => {
            res.redirect('/admin/Categories?action=editSubSub'); 
        })
        .catch(err => next(err));
}

exports.postEditCategory = (req, res, next) => {

    const id = req.body.id;
    const name = req.body.name;
    const description = req.body.description;

    Category.findById(id)
        .then(category => {
            category.name = name;
            category.description = description;
            return category.save();
        }).then(() => {
            res.redirect('/admin/categories?action=edit'); 
        })
        .catch(err => next(err));
}

exports.postDeleteCategory= (req, res, next) => {

    const id = req.body.categoryid;

    Category.findByIdAndRemove(id)
        .then(() => {
            res.redirect('/admin/categories?action=delete');
        })
        .catch(err => {
            next(err);
        });
}

exports.postDeleteSubCategory= (req, res, next) => {

    const id = req.body.categoryid;

    SubCategory.findByIdAndRemove(id)
        .then(() => {
            res.redirect('/admin/categories?action=deleteSub');
        })
        .catch(err => {
            next(err);
        });
}

exports.postDeleteSubSubCategory= (req, res, next) => {

    const id = req.body.categoryid;

    SubSubCategory.findByIdAndRemove(id)
        .then(() => {
            res.redirect('/admin/categories?action=deleteSubSub');
        })
        .catch(err => {
            next(err);
        });
}

//Confirmation işlemleri
//get confirmation
exports.getConfirmation = (req, res, next) => {
    Confirmation
        .find()
        .populate('userId')
        .then(confirm => {
            res.render('admin/confirmation', {
                title: 'Onaylama Sayfası',
                products: confirm,
                path: '/admin/confirmation',
                action: req.query.action
            });
        })
        .catch((err) => {
            next(err);
        });
}

exports.getEditConfirmation= (req, res, next) => {
    Confirmation
        .findOne({_id: req.params.productid,})
        .then(confirm => {
            if(!confirm){
                return res.redirect('/');
            }
            return confirm;
        })
        .then(confirm => {

            SubSubCategory.find()
                .then(categories => {

                    categories = categories.map(category => {

                        if(confirm.categories){
                            confirm.categories.find(item => {
                                if(item.toString() === category._id.toString()){
                                    category.selected = true;
                                }
                            })
                        }
                        return category;
                    })

                    res.render('admin/edit-confirmation', {
                        title: 'Ürün İnceleme-Onaylama',
                        path: '/admin/confirmation',
                        product: confirm,
                        categories: categories
                    });
                })
        })
        .catch(err => { next(err); });

}

//post edit confirmation
exports.postEditConfirmation = (req, res, next) => {

    const id = req.body.id;
    const name = req.body.name; 
    const price = req.body.price;
    const image = req.body.image;
    const description = req.body.description;
    const nameOfSeller = req.body.nameOfSeller;
    const phoneOfSeller = req.body.phoneOfSeller;
    const mailOfSeller = req.body.mailOfSeller;
    const ids = req.body.categoryids;
    const userid = req.body.userid;
    const isSecondHand = req.body.isSecondHand;
    const city = req.body.city;

        const confirm = new Product(
            {
                name: name,
                price: price,
                imageUrl: image,
                description: description,
                nameOfSeller: nameOfSeller,
                phoneOfSeller: phoneOfSeller,
                mailOfSeller: mailOfSeller,
                userId: userid,
                categories: ids,
                isSecondHand: isSecondHand,
                city: city
            }
        );
         
        confirm.save()
            .then(result => {
                res.redirect('/admin/confirmation?action=confirm');
            })
            .catch(err => {
                
                if(err.name == 'ValidationError'){
                    let message = '';
                    for(field in err.errors){
                        message += err.errors[field].message + '<br>';
                    }
    
                    res.render('admin/add-product', {
                        title: 'Yeni Ürün Ekleme',
                        path: '/admin/add-product',
                        errorMessage: message,
                        inputs:{
                            name: name,
                            price: price,
                            description: description
                        }
                    });
                }else{
                    //res.redirect('/500');
                    next(err);
                }
            });
            
        // Silme işlemi
        Confirmation.findOne({_id: id})
            .then(product => {
                if(!product){
                    return next(new Error('Silinmek istenen ürün bulunamadı.'));
                }

                return Confirmation.deleteOne({_id: id})
            })
            .catch(err => {
                next(err);
            });
}

//post delete confirmation
exports.postDeleteConfirmation= (req, res, next) => {

    const id = req.body.productid;

    Confirmation.findOne({_id: id})
        .then(product => {
            if(!product){
                return next(new Error('Silinmek istenen ürün bulunamadı.'));
            }
            fs.unlink('public/img/' + product.imageUrl, err => {
                if(err){
                    console.log(err);
                }
            });

            return Confirmation.deleteOne({_id: id})
        }).then((result) => {
            if(result.deletedCount === 0){
                return next(new Error('Silinmek istenen ürün bulunamadı.'));
            }
            
            res.redirect('/admin/confirmation?action=delete');
        })
        .catch(err => {
            next(err);
        });
}

//getallProducts
exports.getAllProducts = (req, res, next) => {
    Product
        .find()
        .populate('userId')
        .then(products => {
            res.render('admin/all-products', {
                title: 'Tüm Ürünler',
                products: products,
                path: '/admin/all-products',
                action: req.query.action
            });
        })
        .catch((err) => {
            next(err);
        });
}

//getallUsers
exports.getAllUsers = (req, res, next) => {
    User
        .find()
        .then(users => {
            res.render('admin/all-users', {
                title: 'Tüm Kullanıcılar',
                users: users,
                path: '/admin/all-users',
                action: req.query.action
            });
        })
        .catch((err) => {
            next(err);
        });
}

exports.postDeleteUser= (req, res, next) => {

    const id = req.body.productid;

    User.findOne({_id: id})
        .then(user => {
            if(!user){
                return next(new Error('Silinmek istenen kullanıcı bulunamadı.'));
            }

            return User.deleteOne({_id: id})
        }).then((result) => {
            if(result.deletedCount === 0){
                return next(new Error('Silinmek istenen ürün bulunamadı.'));
            }
            
            res.redirect('/admin/all-users?action=delete');
        })
        .catch(err => {
            next(err);
        });
}

//All Products---------
exports.getEditAllProducts= (req, res, next) => {
    Product
        .findOne({_id: req.params.productid})
        .then(confirm => {
            if(!confirm){
                return res.redirect('/');
            }
            return confirm;
        })
        .then(confirm => {

            SubSubCategory.find()
                .then(categories => {

                    categories = categories.map(category => {

                        if(confirm.categories){
                            confirm.categories.find(item => {
                                if(item.toString() === category._id.toString()){
                                    category.selected = true;
                                }
                            })
                        }
                        
                        return category;
                    })

                    res.render('admin/edit-all-products', {
                        title: 'Ürün İnceleme',
                        path: '/admin/edit-all-products',
                        product: confirm,
                        categories: categories
                    });
                })
        })
        .catch(err => { next(err); });
}

//post edit all-products
exports.postEditAllProducts = (req, res, next) => {

    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const image = req.file;
    const description = req.body.description;
    const ids = req.body.categoryids;
    const userid = req.body.userid;
    const nameOfSeller = req.body.nameOfSeller;
    const phoneOfSeller = req.body.phoneOfSeller;
    const mailOfSeller = req.body.mailOfSeller;
    const isSecondHand = req.body.isSecondHand;
    
    Product.findOne({_id:id})
        .then(product => {
            if(!product){
                return res.redirect('/');
            }
            
            product.name = name;
            product.price = price;
            product.image = image;
            product.description = description;
            product.categories = ids;
            product.userid = userid;
            product.nameOfSeller = nameOfSeller;
            product.phoneOfSeller = phoneOfSeller
            product.mailOfSeller = mailOfSeller
            product.isSecondHand = isSecondHand;

            return product.save();
        }).then(result => {
            res.redirect('/admin/all-products?action=edit');
        }).catch(err => {
            next(err);
        });
}

exports.postDeleteAllProducts = (req, res, next) => {

    const id = req.body.productid;
    
    Product.findOne({_id: id})
        .then(product => {
            if(!product){
                return next(new Error('Silinmek istenen ürün bulunamadı.'));
            }   
            fs.unlink('public/img/' + product.imageUrl, err => {
                if(err){
                    console.log(err);
                }
            });

            return Product.deleteOne({_id: id})
        }).then((result) => {
            if(result.deletedCount === 0){
                return next(new Error('Silinmek istenen ürün bulunamadı.'));
            }
            
            res.redirect('/admin/all-products?action=delete');
        })
        .catch(err => {
            next(err);
        });
}