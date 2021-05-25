const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const path = require('path');

app.set('view engine', 'pug');
app.set('views', './views');

const isAuthentication = require('./middleware/authentication');
const locals = require('./middleware/locals');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/shop');
const accountRoutes = require('./routes/account');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoDbStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const multer = require('multer');

const errorController = require('./controllers/errors');

const User = require('./models/user');
const ConnectionString = 'mongodb+srv://garavolli:enekcanel@cluster0.chjjh.mongodb.net/node-app?retryWrites=true&w=majority';
   
var store = new mongoDbStore({
    uri: ConnectionString,
    collection: 'mySessions'
})

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/img/');
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); //image-32132131.jpg
    }
});

app.use(bodyParser.urlencoded({ extended: false })); 
app.use(multer({ storage: storage }).array('image',4));
app.use(cookieParser());
app.use(session({ 
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*24*7 //1 hafta
    },
    store: store
}));

app.use(express.static(path.join(__dirname, 'public')));


app.use((req, res, next) => {

    if(!req.session.user){
        return next();
    }

    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => { console.log(err) });
})

app.use(csurf());

app.use('/admin', adminRoutes);
app.use(userRoutes);
app.use(accountRoutes);

app.use('/500',isAuthentication,locals, errorController.get500Page);
app.use(isAuthentication,locals,errorController.get404Page);
app.use((error, req, res, next) => {
    res.status(500).render('error/500', {title: 'Hata Sayfası'});
});

mongoose.connect(ConnectionString)
    .then(() => {
        console.log('Veritabanına bağlanıldı..');
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => {
        console.log(err);
    }) 