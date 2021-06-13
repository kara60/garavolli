const Product = require('../models/product');
const User = require('../models/user');
const Confirmation = require('../models/confirmation');
const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
const SubSubCategory = require('../models/sub-sub-category');
const fs = require('fs');
const nodemailer = require("nodemailer");

exports.getProducts = async (req, res, next) => {
    try{
        const products = await Product
            .find({userId: req.user._id})
            .populate('userId', 'name -_id')
            .select('name price imageUrl userId');
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const subsubcategories = await SubSubCategory.find();

        res.render('admin/products', {
            title: 'Ürünlerim',
            products: products,
            path: '/admin/products',
            action: req.query.action,
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories
        });
    }
    catch(err){
        next(err);
    }       
}

exports.getChooseCategory = async (req, res, next) => {
    try{
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const subsubcategories = await SubSubCategory.find();

        res.render('admin/choose-category', {
            title: 'Ana Kategori Seç',
            path: '/admin/choose-category',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories
        })
    }
    catch(err){
        next(err);
    }
}

exports.getChooseSubCategory = async (req, res, next) => {
    try{
        const categoryid = req.params.categoryid;
        const model = [];

        const categories = await Category.find();
        model.categories = categories;

        const subsubcategories = await SubSubCategory.find();
        const subcategories = await SubCategory.find();

        const chooseCategories = await SubCategory.find({ categories: categoryid });

        res.render('admin/choose-sub-category', {
            title: 'Ürünler',
            chooseCategories: chooseCategories,
            selectedCategory: categoryid,
            path: '/admin/choose-sub-category',
            action: req.query.action,
            categories: categories,
            subcategories: subcategories,
            subsubcategories:subsubcategories

        });
    }
    catch(err){
        next(err);
    }
}



exports.getChooseSubSubCategory = async (req, res, next) => {
    try{
        const categoryid = req.params.categoryid;
        const model = [];
        
        const categories = await Category.find();
        const subsubcategories = await SubSubCategory.find();

        const subcategories = await SubCategory.find();
        model.subcategories = subcategories;
        const choosesubsubCategories = await SubSubCategory.find({ categories: categoryid })

        res.render('admin/choose-sub-sub-category', {
            title: 'Ürünler',
            choosesubsubCategories: choosesubsubCategories,
            selectedCategory: categoryid,
            path: '/admin/choose-sub-sub-category',
            action: req.query.action,
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories


        });
    }
    catch(err){
        next(err);
    }
}

exports.getAddProduct = async (req, res, next) => {
    try{
        const categoryid = req.params.categoryid;

        const subsubCategories = await SubSubCategory.find();

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
    }
    catch(err){
        next(err);
    }
}

exports.postAddProduct = async (req, res, next) => {
    try{
        const name = req.body.name;
        const price = req.body.price;
        const image = req.files;
        const description = req.body.description;
        const nameOfSeller = req.body.nameOfSeller;
        const phoneOfSeller = req.body.phoneOfSeller;
        const userForEmail = await User.find({ _id: req.user._id }, 'email');
        const mailOfSeller = userForEmail[0].email;
        const categoryid = req.body.categoryids;
        const isSecondHand = req.body.isSecondHand;
        const city = req.body.city;
        const productQuantity = req.body.quantity;

        const imgs = await image.map(s => s.filename);

        const confirm = new Confirmation(
            {
                name: name,
                price: price,
                imageUrl: imgs,
                description: description,
                nameOfSeller: nameOfSeller,
                phoneOfSeller: phoneOfSeller,
                mailOfSeller: mailOfSeller,
                userId: req.user,
                categories: categoryid,
                isSecondHand: isSecondHand,
                city: city,
                productQuantity: productQuantity
            }
        );

        await confirm.save();
        res.redirect('/profile?action=waiting');

    }
    catch(err){
        next(err);
    }
}

exports.getEditProduct= async (req, res, next) => {
    try{
        const confirm = await Product.findOne({ _id: req.params.productid, userId:req.user._id });
        if(!confirm){
            res.redirect('/');
        }

        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        
        let subsubcategories = await SubSubCategory.find();
        subsubcategories =  subsubcategories.map(category => {

            if(confirm.subsubcategories){
                confirm.subsubcategories.find(item => {
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
            subsubcategories: subsubcategories,
            categories:categories,
            subcategories:subcategories
        });
    }
    catch(err){
        next(err);
    }
}

exports.postEditProduct = async (req, res, next) => {
    try{
        const id = req.body.id;
        const name = req.body.name; 
        const price = req.body.price;
        const description = req.body.description;
        const city = req.body.city;
        const nameOfSeller = req.body.nameOfSeller;
        const phoneOfSeller = req.body.phoneOfSeller;
        const mailOfSeller = req.body.mailOfSeller;
        const ids = req.body.categoryids;
        const userid = req.body.userid;
        const isSecondHand = req.body.isSecondHand;
        const productQuantity = req.body.productQuantity;

        const imageSelect = await Product.findOne({_id: id}, 'imageUrl');

        if(imageSelect.imageUrl.length === 1){
            var image = req.body.image;
            var img = [image];
        }

        if(imageSelect.imageUrl.length === 2){
            var image = req.body.image;
            var image2 = req.body.image2;
            var img = [image,image2];
        }
        if(imageSelect.imageUrl.length === 3){
            var image = req.body.image;
            var image2 = req.body.image2;
            var image3 = req.body.image3;
            var img = [image,image2,image3];
        }
        if(imageSelect.imageUrl.length === 4){
            var image = req.body.image; 
            var image2 = req.body.image2;
            var image3 = req.body.image3;
            var image4 = req.body.image4;
            var img =  [image,image2,image3,image4];
        }

        const confirm = new Confirmation(
            {
                name: name,
                price: price,
                imageUrl: img,
                description: description,
                city: city,
                nameOfSeller: nameOfSeller,
                phoneOfSeller: phoneOfSeller,
                mailOfSeller: mailOfSeller,
                userId: req.user,
                categories: ids,
                isSecondHand: isSecondHand,
                productQuantity: productQuantity
            }
        );

        await confirm.save();

        const product = await Product.findOne({_id: id})
        if(!product){
            return next(new Error('Silinmek istenen ürün bulunamadı.'));
        }

        await Product.deleteOne({_id: id})

        res.redirect('/profile?action=edit');
    }
    catch(err){
        next(err);
    }
}

exports.postDeleteProduct = async (req, res, next) => {
    try{
        const id = req.body.productid;
        const product = await Product.findOne({ _id: id, userId: req.user._id })
        const user = await User.find({ "cart.items.productId": id })
        
        if(!product){
            return next(new error('Silinmek istenen ürün bulunamadı.'))
        }

        const imagesSelect = product.imageUrl;

        if(imagesSelect.length == 1){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
        }
        if(imagesSelect.length == 2){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
        }
        if(imagesSelect.length == 3){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[2], err => {
                if(err){
                    console.log(err);
                }
            });
        }
        if(imagesSelect.length == 4){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[2], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[3], err => {
                if(err){
                    console.log(err);
                }
            });
        }

        for(var i=0; i<user.length; i++){
            await user[i].deleteCartItem(id);
        }
        const result = await Product.deleteOne ({ _id: id, userId: req.user._id  })

        if(result.deletedCount === 0){
            return next(new Error('Silinmek istenen ürün bulunamadı.'));
        }
        
        res.redirect('/profile?action=delete');
}
    catch(err){
        next(err);
    }
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
exports.getConfirmation = async(req, res, next) => {
    try{
        const confirm = await Confirmation.find().populate('userId');

        res.render('admin/confirmation', {
            title: 'Onaylama Sayfası',
            products: confirm,
            path: '/admin/confirmation',
            action: req.query.action
        });
    }
    catch(err){
        next(err);
    }
}

exports.getEditConfirmation= async (req, res, next) => {
    try{
        let confirm = await Confirmation.findOne({ _id: req.params.productid });
        if(!confirm){
            return res.redirect('/');
        }
        
        const categories = await Category.find();
        const subcategories = await SubCategory.find();

        let subsubcategories = await SubSubCategory.find();
        subsubcategories = subsubcategories.map(category => {
            if(confirm.subsubcategories){
                 confirm.subsubcategories.find(item => {
                    if(item.toString() === category._id.toString()){
                        category.selected = true;
                    }
                })
            }
            return category;
        });

        res.render('admin/edit-confirmation', {
            title: 'Ürün İnceleme-Onaylama',
            path: '/admin/confirmation',
            product: confirm,
            subsubcategories: subsubcategories,
            categories:categories,
            subcategories:subcategories
        });
    }
    catch(err){
        next(err);
    }
}

//post edit confirmation
exports.postEditConfirmation = async (req, res, next) => {
    try{
        const id = req.body.id;
        const name = req.body.name; 
        const price = req.body.price;
        const description = req.body.description;
        const nameOfSeller = req.body.nameOfSeller;
        const phoneOfSeller = req.body.phoneOfSeller;
        const mailOfSeller = req.body.mailOfSeller;
        const ids = req.body.categoryids;
        const userid = req.body.userid;
        const isSecondHand = req.body.isSecondHand;
        const city = req.body.city;
        const productQuantity = req.body.productQuantity;

        const imageSelect = await Confirmation.findOne({_id: id}, 'imageUrl');

        if(imageSelect.imageUrl.length === 1){
            var image = req.body.image;
            var img = [image];
        }

        if(imageSelect.imageUrl.length === 2){
            var image = req.body.image;
            var image2 = req.body.image2;
            var img = [image,image2];
        }
        if(imageSelect.imageUrl.length === 3){
            var image = req.body.image;
            var image2 = req.body.image2;
            var image3 = req.body.image3;
            var img = [image,image2,image3];
        }
        if(imageSelect.imageUrl.length === 4){
            var image = req.body.image; 
            var image2 = req.body.image2;
            var image3 = req.body.image3;
            var image4 = req.body.image4;
            var img =  [image,image2,image3,image4];
        }

        const confirm = new Product(
            {
                name: name,
                price: price,
                imageUrl: img,
                description: description,
                nameOfSeller: nameOfSeller,
                phoneOfSeller: phoneOfSeller,
                mailOfSeller: mailOfSeller,
                userId: userid,
                categories: ids,
                isSecondHand: isSecondHand,
                city: city,
                productQuantity: productQuantity
            }
        );

        await confirm.save()
        const product = await Confirmation.findOne({_id: id})
        if(!product){
            return next(new Error('Silinmek istenen ürün bulunamadı.'));
        }
        await Confirmation.deleteOne({_id: id})
        
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
            to:mailOfSeller,
            subject: "ÜRÜNÜNÜZ ONAYLANMIŞTIR!",
            html: `
            <p>Ürününüzü inceledik ve satışa sunmakta herhangi bir sakınca olmadığı gördük, iyi satışlar..</p>
            <p>Garavolli Ekibi</p>    
            `
        };

        transfer.sendMail(mailBilgi, err => {
            if(err){
                next(err);
            }
            else{
                
            }
        });

        res.redirect('/admin/confirmation?action=confirm')
    }
    catch(err){
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
            next(err);
        }
    }
}

//post delete confirmation
exports.postDeleteConfirmation= async (req, res, next) => {
    try{
        const id = req.body.productid;

        const product = await Confirmation.findOne({ _id: id });
        if(!product){
            return next(new Error('Silinmek istenen ürün bulunamadı.'));
        }

        const imagesSelect = product.imageUrl;

        if(imagesSelect.length == 1){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
        }

        if(imagesSelect.length == 2){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
        }

        if(imagesSelect.length == 3){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[2], err => {
                if(err){
                    console.log(err);
                }
            });
        }
        if(imagesSelect.length == 4){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[2], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[3], err => {
                if(err){
                    console.log(err);
                }
            });
        }

        const result = await Confirmation.deleteOne({_id: id})
        if(result.deletedCount === 0){
            return next(new Error('Silinmek istenen ürün bulunamadı.'));
        }
        
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
            to: product.mailOfSeller,
            subject: "ÜRÜNÜNÜZ ONAYLANMAMIŞTIR!",
            html: `
            <p>Ürününüzü inceledik ve satış kurallarına uymadığına karar vererek onaylamadık.</p> 
            <p>Garavolli Ekibi</p>
            `
              
        };

        transfer.sendMail(mailBilgi, err => {
            if(err){
                next(err);
            }
            else{
                
            }
        });
        res.redirect('/admin/confirmation?action=delete'); 
    }
    catch(err){
        next(err);
    }
}

//getallProducts
exports.getAllProducts = async(req, res, next) => {
    try{
        const products = await Product.find().populate('userId');

        res.render('admin/all-products', {
            title: 'Tüm Ürünler',
            products: products,
            path: '/admin/all-products',
            action: req.query.action
        });
    }
    catch(err){
        next(err);
    }
}

//getallUsers
exports.getAllUsers = async (req, res, next) => {
    try{
        const users = await User.find();

        res.render('admin/all-users', {
            title: 'Tüm Kullanıcılar',
            users: users,
            path: '/admin/all-users',
            action: req.query.action
        });
    }
    catch(err){
        next(err);
    }
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
exports.getEditAllProducts= async(req, res, next) => {
    try{
        let confirm = await Product.findOne({ _id: req.params.productid });
        if(!confirm){
            return res.redirect('/');
        }
        
        let subsubcategories = await SubSubCategory.find();
        const subcategories = await SubCategory.find();
        const categories = await Category.find();

        subsubcategories = subsubcategories.map(category => {
            if(confirm.subsubcategories){
                confirm.subsubcategories.find(item => {
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
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories
        });
    }
    catch(err){
        next(err);
    }
    
}

//post edit all-products
exports.postEditAllProducts = async(req, res, next) => {
    try{
        const id = req.body.id;
        const name = req.body.name;
        const price = req.body.price;
        const description = req.body.description;
        const ids = req.body.categoryids;
        const userid = req.body.userid;
        const nameOfSeller = req.body.nameOfSeller;
        const phoneOfSeller = req.body.phoneOfSeller;
        const mailOfSeller = req.body.mailOfSeller;
        const isSecondHand = req.body.isSecondHand;
        const city = req.body.city;
        const productQuantity = req.body.productQuantity;

        const product = await Product.findOne({ _id:id });
        if(!product){
            return res.redirect('/');
        }

        const imageSelect = await Product.findOne({_id: id}, 'imageUrl');

        if(imageSelect.imageUrl.length === 1){
            var image = req.body.image;
            var img = [image];
        }
        if(imageSelect.imageUrl.length === 2){
            var image = req.body.image;
            var image2 = req.body.image2;
            var img = [image,image2];
        }
        if(imageSelect.imageUrl.length === 3){
            var image = req.body.image;
            var image2 = req.body.image2;
            var image3 = req.body.image3;
            var img = [image,image2,image3];
        }
        if(imageSelect.imageUrl.length === 4){
            var image = req.body.image; 
            var image2 = req.body.image2;
            var image3 = req.body.image3;
            var image4 = req.body.image4;
            var img =  [image,image2,image3,image4];
        }

        product.name = name;
        product.price = price;
        product.image = img;
        product.description = description;
        product.categories = ids;
        product.userid = userid;
        product.nameOfSeller = nameOfSeller;
        product.phoneOfSeller = phoneOfSeller
        product.mailOfSeller = mailOfSeller
        product.isSecondHand = isSecondHand;
        product.city = city;
        product.productQuantity = productQuantity;

        product.save();

        res.redirect('/admin/all-products?action=edit');
    }
    catch(err){
        next(err);
    }
}

exports.postDeleteAllProducts = async (req, res, next) => {
    try{
        const id = req.body.productid;
        const user = await User.find({ "cart.items.productId": id })

        const product = await Product.findOne({ _id: id });
        if(!product){
            return next(new Error('Silinmek istenen ürün bulunamadı.'));
        }

        const imagesSelect = product.imageUrl;

        if(imagesSelect.length == 1){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
        }

        if(imagesSelect.length == 2){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
        }

        if(imagesSelect.length == 3){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[2], err => {
                if(err){
                    console.log(err);
                }
            });
        }
        if(imagesSelect.length == 4){
            fs.unlink('public/img/' + imagesSelect[0], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[1], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[2], err => {
                if(err){
                    console.log(err);
                }
            });
            fs.unlink('public/img/' + imagesSelect[3], err => {
                if(err){
                    console.log(err);
                }
            });
        }
        
        for(var i=0; i<user.length; i++){
            await user[i].deleteCartItem(id);
        }
        const result = await Product.deleteOne({ _id: id});

        if(result.deletedCount === 0){
            return next(new Error('Silinmek istenen ürün bulunamadı.'));
        }

        res.redirect('/admin/all-products?action=delete');
    }
    catch(err){
        next(err);
    }
}