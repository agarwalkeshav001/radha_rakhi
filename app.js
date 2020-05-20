var express = require("express"),
    app     = express(),
    path    = require("path"),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    multer = require('multer'),
    GridFsStorage = require('multer-gridfs-storage'),
    Grid = require('gridfs-stream'),
    Mongoose = require("mongoose"),
    Bcrypt = require("bcryptjs");

const User = require('./models/user.js'),
      Rakhi =require('./models/rakhi.js'),
      Word = require('./models/word.js'),
      Feed = require('./models/feed.js'),
      Wordw = require('./models/wordw.js'),
      Product = require('./models/product.js'),
      Order =require('./models/order.js');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'views')));

let gfs;
const uri = "mongodb://localhost:27017/RadhaRakhi";


Mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});

const conn = Mongoose.connection
conn.once('open',()=>{
    console.log("Connected to mongodb");
    gfs = Grid(conn.db, Mongoose.mongo);  
    gfs.collection('images');
})

app.use(session({
    key: 'user_name',
    secret: 'mainhoonadmin',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 1500000
    }
}));

// Create storage engine
const storage = new GridFsStorage({
    url: "mongodb://localhost:27017/RadhaRakhi",
    file: (req, file) => {
      return new Promise((resolve, reject) => {
          const filename = file.originalname;
          const fileInfo = {
            filename: filename,
            bucketName: 'images'
          };
          resolve(fileInfo);
      });
    }
  });
  
const DBupload = multer({ storage });

app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, image) => {
        // Check if image
        if (!image || image.length === 0) {
            return res.status(404).json({
                err: 'No image exists'
            });
        }
        // Check if image
        if (image.contentType === 'image/jpeg' || image.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(image.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
}); 


////////////////////////////////
/// Routes Section 
///////////////////////////////

app.get('/',(req,res)=>{
    res.redirect('/index');
})

app.get('/index',(req,res)=>{
    res.render('index.ejs',{userinfo: req.session});
})

app.get('/privacy',(req,res)=>{
    res.render('privacy.ejs',{userinfo: req.session});
})

app.get('/termsofuse',(req,res)=>{
    res.render('terms.ejs',{userinfo: req.session});
})


app.get('/upload',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        var words={};
        var wordws={};
        var products={}
        Word.find({}, function(err, allwords) {
            if (err) {
                console.log(err);
            } else {
                words=allwords;             
            }
        });
        
        Wordw.find({},function(err, allwordws){
            if (err) {
                console.log(err);
            } else {
                wordws=allwordws;             
            }
        });  
        Product.find({},function(err, allproducts){
            if (err) {
                console.log(err);
            } else {
                products=allproducts;     
                res.render("uproduct.ejs",{words:words,wordws:wordws,products:products,userinfo:req.session});        
            }
            })
    }
    else{
        res.redirect('/login')
    }
    
})



  
    app.post('/uplrakhi',DBupload.single('image'),(req,res)=>{
        if(req.session.role== 'admin' && req.cookies.user_name){
    var pname = req.body.name;
    var ptype =  req.body.type;
    var ptyp = req.body.typ;
    var ppiece = req.body.pieces;
    var pprice = req.body.price;
    var typequant =req.body.pieceunit ;
    var sprice =req.body.priceunitt;
    var pricequant = req.body.priceunit;
    var pimg = req.file.filename;

    Rakhi.create({
        name:pname,
        type:ptype,
        typ:ptyp,
        pieces:ppiece,
        price:pprice,
        sprice:sprice,
        typequan:typequant,
        pricequan:pricequant,
        img:pimg

    }
    
    ,(err)=>{
        if(err){
           res.status(500).send(err);
        }
        
        else{
            var message = JSON.parse('{"message":"Product Added Successfully."}')
            res.send(message);
        }
        
        
    }) 
}
else{
    res.redirect('/login');
}
    
})



app.get('/shop',(req,res)=>{
    Rakhi.find({}, function(err, data) {
        userinfo = req.session;
        res.render('shop.ejs', {prods: data,userinfo:req.session})
})

});

app.post('/cart',(req,res)=>{
    console.log(req.body);
    //console.log(req);
    var user = req.session.user;
    var name =  req.body.name;
    var firm =  req.body.firm;
    var mail =  req.body.mail;
    var phone = req.body.phone;
    var phn = req.body.phn;
    var address = req.body.address;
    var city = req.body.city;
    var state = req.body.state;
    var zip = req.body.zip;
    var country = req.body.country;
    var ord = req.body.cart;
    var total= req.body.total;
    var comment = req.body.comment;

    Order.create({
        user:user,
        name:name,
        firm:firm,
        mail:mail,
        phone:phone,
        phn:phn,
        address:address,
        city:city,
        state:state,
        total:total,
        ord:ord,
        zip:zip,
        country:country,
        comment:comment,
        timestamp:new Date()

    }
    
    ,(err)=>{
        if(err){
                res.status(500).send(err);
            }
        
        
        else{
            res.render('checkout.ejs',{userinfo:req.session});
        }
        
        
    })
    
})



   app.get('/checkout',(req,res)=>{
       res.render('checkout.ejs',{userinfo:req.session});
   })

   app.get('/addkeyword',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
       res.render('addkeyword.ejs',{userinfo:req.session});
    }
   })

   app.get('/addkeywordwo',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
       res.render('addkeywordwo.ejs',{userinfo:req.session});
    }
   })
   app.post('/addkeywordwout',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        var word = req.body.wkeyword;
        
    
        Wordw.create({
            keyword:word,
    
        }
        
        ,(err)=>{
            if(err){
               res.status(500).send(err);
            }
            
            else{
                var message = JSON.parse('{"message":"Keyword Added Successfully."}')
                res.send(message);
            }
            
            
        }) 
    }
    else{
        res.redirect('/login');
    }

    
   })


   app.post('/keyword',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        var word = req.body.keyword;
        
    
        Word.create({
            keyword:word,
    
        }
        
        ,(err)=>{
            if(err){
               res.status(500).send(err);
            }
            
            else{
                var message = JSON.parse('{"message":"Keyword Added Successfully."}')
                res.send(message);
            }
            
            
        }) 
    }
    else{
        res.redirect('/login');
    }

    
   })

   app.get('/delproducttype',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        Product.find({}, function(err, data) {
        res.render('delproducttype.ejs', {products: data,userinfo: req.session});
        })
    }
    else{
        res.redirect('/login')
    }

   })


   app.get('/delkeywordwo',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        Wordw.find({}, function(err, data) {
        res.render('delkeywordwo.ejs', {words: data,userinfo: req.session});
        })
    }
    else{
        res.redirect('/login')
    }

   })

   app.get('/addproducttype',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        res.render('addproducttype.ejs',{userinfo:req.session});
     }

   })

   app.post('/addproducttypes',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        var word = req.body.keywordproduct;
        
    
        Product.create({
            keyword:word,
    
        }
        
        ,(err)=>{
            if(err){
               res.status(500).send(err);
            }
            
            else{
                var message = JSON.parse('{"message":"Keyword Added Successfully."}')
                res.send(message);
            }
            
            
        }) 
    }
    else{
        res.redirect('/login');
    }

    
   })

   app.post('/deleteproductword',(req,res)=>{
       if(req.session.role== 'admin' && req.cookies.user_name){
        var keyword=req.body.word;
        Product.deleteOne({"keyword":keyword},function(err,obj){
            if(err) res.send(err);
            else
            var message = JSON.parse('{"message":"Keyword Deleted."}')
            res.send(message);
    

    })
}
else{
    res.redirect('/login')
}
})


   app.get('/delkeyword',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        Word.find({}, function(err, data) {
        res.render('delkeyword.ejs', {words: data,userinfo:req.session});
        })
    }
    else{
        res.redirect('/login')
    }

   })

   app.post('/deletekeyword',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        var keyword=req.body.word;
        Wordw.deleteOne({"keyword":keyword},function(err,obj){
                if(err) res.send(err);
                else
                var message = JSON.parse('{"message":"Keyword Deleted."}')
                res.send(message);
        

        })
    }
    else{
        res.redirect('/login')
    }
   })



   app.get('/deleterak',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        Rakhi.find({}, function(err, data) {
        res.render('deleterak.ejs', {orderrs: data,userinfo:req.session});
        })
    }
    else{
        res.redirect('/login')
    }

   })

   app.post('/delrak',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        Rakhi.findOne({name:req.body.product},(err,delrakhi)=>{
            console.log(delrakhi)
            if(!delrakhi){
                var message = JSON.parse('{"message":"Product not found"}')
                res.send(message); 
            }
            else{
                Rakhi.deleteOne({'name':delrakhi.name},(err)=>{
                    if(err) res.send(err);
                    else{
                        gfs.remove({ filename: delrakhi.img, root: 'images' }, (err) => {
                            if (err) {
                                return res.status(404).json({ err: err })
                            }
                            else{
                                var message = JSON.parse('{"message":"Product Deleted."}')
                                res.send(message);
                            }
                        })
                    }
                })
            }
        })
    }
    else{
        res.redirect('/login');
    }
   })

   app.post('/changepassword',(req,res)=>{
    if(req.session.role == 'member' && req.cookies.user_name){
    var myquery = { username: req.session.user};
    var newvalues = { $set: {password: Bcrypt.hashSync(req.body.password, 10) } };
    
        User.updateOne(myquery, newvalues, function(err, data){
        res.render('changepassword.ejs',{userinfo:req.session});
        })
    }
    else{
        res.redirect('/login');
    }
   

})

   app.get('/deleteuser',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        User.find({}, function(err, data) {
        res.render('deleteuser.ejs', {userrs: data,userinfo:req.session});
        })
    }
    else{
        res.redirect('/login')
    }

   })

   app.post('/deluser',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        var name=req.body.user;
        User.deleteOne({"username":name},function(err,obj){
                if(err) res.send(err);
                else
                var message = JSON.parse('{"message":"User Deleted."}')
                res.send(message);
        

        })
    }
    else{
        res.redirect('/login')
    }
   })

   

app.get('/admin',(req,res) => {
    if(req.session.role== 'admin' && req.cookies.user_name){
        res.render('adashboard.ejs',{userinfo: req.session});
    }
    else{
        res.redirect('/login')
    }
    
})

app.get('/adminpassword',(req,res) => {
    if(req.session.role== 'admin' && req.cookies.user_name){
        res.render('adminpassword.ejs',{userinfo: req.session});
    }
    else{
        res.redirect('/login')
    }
    
})

app.post('/adminpasswordchange',(req,res) => {
    if(req.session.role=='admin' && req.cookies.user_name){
        var myquery = { username: req.session.user};
        var newvalues = { $set: {password: Bcrypt.hashSync(req.body.password, 10) } };
        
            User.updateOne(myquery, newvalues, function(err, data){
        res.render('adminchangepassword.ejs',{userinfo:req.session});
            })
    }
    else{
        res.redirect('/login');
    }
})

app.get('/showorders',(req,res)=>{
    
    if(req.session.role== 'admin' && req.cookies.user_name){
        Order.find({}, function(err, data) {
        res.render('showorders.ejs', {orders: data,userinfo: req.session});
        })
    }
    else{
        res.redirect('/login')
    }
    
})

app.get('/showfeed',(req,res)=>{
    
    if(req.session.role== 'admin' && req.cookies.user_name){
        Feed.find({}, function(err, data) {
        res.render('showfeed.ejs', {feeds: data,userinfo: req.session});
        })
    }
    else{
        res.redirect('/login')
    }
    
})
    
app.get('/addanyuser',(req,res)=>{
    
    if(req.session.role== 'admin' && req.cookies.user_name){
        res.render('addanyuser.ejs', {userinfo: req.session});
    }
    else{
        res.redirect('/login')
    }
    
})  
    
app.post('/addanuser',(req,res)=>{

    if(req.session.role== 'admin' && req.cookies.user_name){
    var user = req.body.username;
    var pass =  Bcrypt.hashSync(req.body.password, 10);
    var role = req.body.role;

    User.create({
        username:user,
        password:pass,
        role:role
    }
    
    ,(err)=>{
        if(err){
            if(err.code=='11000'){
                res.status(500).send({'error':'duplicate user name'}); 
            }
            else{
                res.status(500).send(err);
            }
        }
        
        else{
            var message = JSON.parse('{"message":"Account Successfuly Registered"}');
            res.send(message)
        }
        
        
        
    })
}
else{
    res.redirect('/login')
}

})

    
  app.post('/zoom',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        
        Order.find({'_id':Object(req.body.oid)}, function(err, data) {
        res.render('zoomorder.ejs', {ordes: data,userinfo: req.session,});
        })
    }
    else{
        res.redirect('/login')
    }

   })


   app.post('/zoomfeed',(req,res)=>{
    if(req.session.role== 'admin' && req.cookies.user_name){
        
        Feed.find({'_id':Object(req.body.fid)}, function(err, data) {
        res.render('zoomfeeds.ejs', {feds: data,userinfo: req.session,});
        })
    }
    else{
        res.redirect('/login')
    }

   })


app.get('/member',(req,res) => {
    if (req.session.role== 'member' && req.cookies.user_name){
        var mysort = { timestamp: -1 };
        Order.find({user:req.session.user}, function(err, data) {
        res.render('mdashboard.ejs',{userorders:data,userinfo: req.session});
        }).sort(mysort);
        }
    else {
        res.redirect('/login');

    }
    
    
})


app.post('/feedback',(req,res)=>{
    var user = req.session.user;
    var name =  req.body.name;
    var mail =  req.body.email;
    var subject = req.body.subject;
    var message = req.body.message;


    Feed.create({
        user:user,
        name:name,
        mail:mail,
        subject:subject,
        message:message,
        timestamp:new Date()
    }
    
    ,(err)=>{
        if(err){
                res.status(500).send(err);
            }
        
        
        else{
            res.render('feedback.ejs');
        }
        
        
    })
    

})


app.get('/login',(req,res) => {
    if(req.session.role== 'admin' && req.cookies.user_name){
        res.redirect('/admin');
    }
    else if (req.session.role== 'member' && req.cookies.user_name){
        res.redirect('/member');
    }
    else {
        res.render('login.ejs');

    }
})

app.post('/login',(req,res) => {
    var username = req.body.username;
    var pass = req.body.password;
    User.findOne({'username':username},(err, user) => {
        if(!user){
            var message = "User not found please try again."
            res.render('validation.ejs',{message});
        }
        else{
            if(Bcrypt.compareSync(pass,user.password)==true){
                req.session.role = user.role;
                req.session.user = user.username;
                console.log(req.session.role);
                console.log(req.session.user);
                res.redirect('/login');
                
            }
            else{
                var message = "Incorrect Credentials ! Please check your credentials!"
                res.render('validation.ejs',{message});
            }
        }
    })
})

app.get('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_name) {
        res.clearCookie('user_name');
        res.redirect('/');
    } else {
        res.redirect('/login');
    }
});

var port = process.env.PORT || 80
app.listen(port, () => {
    console.log(`Server live at port: ${port}`)
})