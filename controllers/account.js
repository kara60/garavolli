const User = require('../models/user');
const Login = require('../models/login');
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');

const Product = require('../models/product');
const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
const SubSubCategory = require('../models/sub-sub-category');
const Order = require('../models/order');
const Confirmation = require('../models/confirmation');
const nodemailer = require('nodemailer');

sgMail.setApiKey('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');

exports.getLogin = async (req, res, next) => {
    try{
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const subsubcategories = await SubSubCategory.find();

        var errorMessage = req.session.errorMessage;
        delete req.session.errorMessage;

        res.render('account/login', {
            path: '/login',
            title: 'Giriş',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories,
            errorMessage: errorMessage,
            action: req.query.action
        });
    }
    catch(err){
        next(err);
    }
}

exports.postLogin = async (req,res,next) => {
    try{
        const email = req.body.email;
        const password = req.body.password;
    
        const loginModel = new Login({
            email: email,
            password: password
        });
        
        await loginModel.validate()
        const user = await User.findOne({ email: email })
        
        if(!user){
            return res.redirect('/login?action=noEmail');
        }
        if(user.status != 'Active'){
            return res.redirect('/login?action=verify');
        }
        const isSuccess = await bcrypt.compare(password,user.password)
        if(isSuccess){
            req.session.user = user;
            req.session.isAuthenticated = true;
            return req.session.save(function(err) {
                var url = req.session.redirectTo || '/';
                delete req.session.redirectTo;
                res.redirect('/');
            });
        }
        req.session.errorMessage = 'Hatalı eposta yada parola girdiniz.';
        req.session.save(function(err){
            return res.redirect('/login');
        })
    }
    catch(err){
        if(err.name == 'ValidationError'){
            let message = '';
            for(field in err.errors){
                message += err.errors[field].message + '<br>';
            }

            res.render('account/login', {
                path: '/login',
                title: 'Giriş',
                errorMessage: message
            }); 
        }else{
            next(err);
        }
    }
}

exports.getRegister = async (req, res, next) => {
    try{
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const subsubcategories = await SubSubCategory.find();

        var errorMessage = req.session.errorMessage;
        delete req.session.errorMessage;

        res.render('account/register', {
            path: '/register',
            title: 'Kayıt Ol',
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories,
            errorMessage: errorMessage
        });
    }
    catch(err){
        next(err)
    }
}

exports.postRegister = async (req,res,next) => {
    try{
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const surname = req.body.surname;

        const user = await User.findOne({ email: email });
        
        if(user){
            req.session.errorMessage = 
            `Bu mail adresi ile daha önce kayıt olunmuş. 
            Eğer parolanızı unuttuysanız lütfen giriş 
            sayfasından şifre sıfırlama işlemini uygulayınız.`;
            req.session.save(function(err){
                console.log(err);
            })
            return res.redirect('/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            surname: surname,
            cart: {items: []}
        });

        await newUser.save();

        res.redirect('/login?action=success');

        const userid = await User.find({ email: email }, '_id');
        const ids = userid.map(s => s._id);
        
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
            to: email,
            subject: "Hesabınız başarıyla oluşturuldu!",
            html: `
                <p>Lütfen hesabınızı aktifleştirmeniz için aşağıdaki linke tıklayınız:</p>
                <a href='http://localhost:3000/verify/${ids}'}'>Aktifleştir</a>
                <p>Garavolli Ekibi</p>
            `
        };

        transfer.sendMail(mailBilgi, err => {
            if(err){
                next(err);
            }
        });
    }
    catch(err){
        if(err.name == 'ValidationError'){
            let message = '';
            for(field in err.errors){
                message += err.errors[field].message + '<br>';
            }

            res.render('account/register', {
                path: '/register',
                title: 'Kayıt Ol',
                errorMessage: message
            }); 
        }else{
            next(err);
        }
    }
}

exports.verifyUser = async (req, res, next) => {
    try{
        const userid = req.params.ids;
        const user = await User.findOne({ _id: userid});
        
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }
        user.status = "Active";
        await user.save();

        return res.redirect('/login?action=verifySuccess');
    }
    catch(err){
        next(err);
    }
    
}


exports.getReset = (req, res, next) => {
    Category.find()
        .then(categories => {
            SubCategory.find()
                .then(subcategories => {
                    SubSubCategory.find()
                        .then(subsubcategories => {
                            var errorMessage = req.session.errorMessage;
                            delete req.session.errorMessage;
                            res.render('account/reset', {
                                path: '/reset-password',
                                title: 'Parola yenileme',
                                categories: categories,
                                subcategories: subcategories,
                                subsubcategories: subsubcategories,
                                errorMessage: errorMessage
                            });
                        })
                })
        })
        .catch((err) => {
            next(err);
        });     
}


exports.postReset = async (req,res,next) => {
    try{
        const email = req.body.email;

        crypto.randomBytes(32, async (err,buffer) => {
            if(err){
                return res.redirect('/reset-password');
            }
            const token = buffer.toString('hex');   
            const user = await User.findOne({ email: email })

            if(!user){
                req.session.errorMessage = 'Mail adresi bulunamadı.';
                await req.session.save(function(err){
                return res.redirect('/register');
                })
            }

            user.resetToken = token;
            user.resetTokenExpiration = Date.now()+3600000;

            await user.save();
            res.redirect('/login?action=reset');

            const msg = {
                to: email,
                from: 'garavollishopping@gmail.com',
                subject: 'Parola Sıfırlama',
                html: 
                `
                <p>Parolanızı güncellemek için aşağıdaki linke tıklayınız</p>
                <p>
                <a href="http://localhost:3000/reset-password/${token}">Parola Sıfırla</a>
                </p>
                <p>Garavolli Ekibi</p>
                `,
            };
            await sgMail.send(msg);
        })
    }
    catch(err){
        next(err);
    }
}

exports.getNewPassword = async (req, res, next) => {
    try{
        const categories = await Category.find();
        const subcategories = await SubCategory.find();
        const subsubcategories = await SubSubCategory.find();

        var errorMessage = req.session.errorMessage;
        delete req.session.errorMessage;
        const token = req.params.token;

        const user = await User.findOne({ 
            resetToken: token, resetTokenExpiration:{
                $gt: Date.now()
            }
         })

         res.render('account/new-password', {
            path: '/new-password',
            title: 'Yeni Parola',
            errorMessage: errorMessage,
            categories: categories,
            subcategories: subcategories,
            subsubcategories: subsubcategories,
            userId: user._id.toString(),
            passwordToken: token
        });
    }
    catch(err){
        next(err);
    }
}


exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const token = req.body.passwordToken;
    let _user;

    User.findOne({
        resetToken: token, 
        resetTokenExpiration:{
            $gt: Date.now()
        },
        _id: userId
    }).then(user => {
        _user = user;
        return bcrypt.hash(newPassword, 10);
    }).then(hashedPassword => {
        _user.password = hashedPassword;
        _user.resetToken = undefined;
        _user.resetTokenExpiration = undefined;
        return _user.save();
    }).then(() => {
        res.redirect('/login?action=newPassword');
    }).catch(err => {
        next(err);
    })
}

exports.getlogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/login');
    });
} 

exports.getRegisterTxt = async (req, res, next) => {
    try{
        res.render('account/registerTxt', {
            path: '/registerTxt',
            title: 'Üyelik Formu'
        });
    }
    catch(err){
        next(err);
    }
}