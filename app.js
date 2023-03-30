
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const md5= require("md5");
// const connection= require("./connection");
const session = require("express-session");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }))
const bcrypt = require('bcrypt')
const mysql = require("mysql");
// const { Router } = require("express");
app.set('view engine', 'ejs')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    // use your databse password to connect.
    database: 'train',
});
connection.connect(function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log("connection created");
    }
});
// connection.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'yoursecretkey',
    resave: false,
    saveUninitialised: true
}));

app.listen(3000, function (res) {
    console.log("server is running on portal 3000");

});
app.get('/add_passengers',(req,res)=>{
    res.sendFile(__dirname+"/passengers/passenger.html");
})
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/home/home.html");
});
app.get("/register", function (req, res) {
    res.sendFile(__dirname + "/register/register.html");
});

app.get("/add", function (req, res) {
    res.sendFile(__dirname + "/course/course.html");
});
app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/login/login.html");
});
app.get("/delete", function (req, res) {
    res.sendFile(__dirname + "/home/home.html");
});
app.get("/hotel", function (req, res) {
    res.sendFile(__dirname + "/hotel/hotel.html");
});
app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/login/login.html");
});


app.post('/register', (req, res) => {
    const { fname, email, pass } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(pass,salt);

    connection.query('SELECT * FROM passengers_details WHERE email=?', [email], (err, result) => {

        if (err) {
            throw err;
        }
        if (result.length > 0) {

            res.redirect('/login');
        }
        else {
            connection.query('INSERT INTO train.passengers_details (id,fname,email,pass) VALUES(?,?,?,?)', [null, fname, email, hash], (error, result) => {
                if (error) {
                    console.log(error);
                    req.session.error = 'registration failed';
                    res.redirect('/register');
                }
                else {
                    res.redirect('/login');
                }

            });
        }
    })

});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;
   
    connection.query('SELECT * FROM train.passengers_details WHERE email=? ', [email], (error, results) => {
        
        if (error) throw error;
        if (results.length == 0) {


            // res.send('email does not exist');
            res.redirect('/login');
        }
        else {
            const user = results[0];
            // const isemailcorrect = bcrypt.compare(email, user.email)
            const ispasswordmatch = bcrypt.compare(pass, user.pass)

            // if (err) throw err;

            if (ispasswordmatch ) {

                req.session.loggedin = true;
                req.session.email = email;
                res.redirect("/landing");


            }
            else {
                res.send('password or email is incorrect');
            }


        }

    });
});
app.get("/landing", function (req, res) {
    if (req.session.loggedin) {
        connection.query('SELECT * FROM train.passengers_details WHERE email=?', [req.session.email], (error, results) => {
            if (error) {
                throw error;
            }
            if (results.length > 0) {
                const user = results[0];
                res.render('landing', { user: results[0] });
                


            }

            res.end();

        });
    };

});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.sendFile(__dirname+'/home/home.html');
    });
});
app.post('/add_passengers',function(req,res){
  const{fname,lname,phoneno,}=req.body;
  

    connection.query('SELECT * FROM passengers WHERE fname=? AND lname=?', [fname,lname], (err, result) => {
    console.log(req.body);
        if (err) {
            throw err;
        }
        if (result.length > 0) {

            res.send('user already exist');
        }
        else {
            connection.query('INSERT INTO passengers (id,fname,lname,phoneno,owner) VALUES(?,?,?,?,?)', [null, fname, lname, phoneno,req.session.email], (error, result) => {
                if (error) {
                    console.log(error);
                   
                }
                else {
                    res.redirect('/landing');
                }

            });
        }
    })

})
app.get('/show_passengers',function(req,res){
    connection.query('SELECT * FROM passengers WHERE owner=?',[req.session.email],(error,result)=>{
         if(error){
            throw error;
         }
        //  show_passengers
         res.render('show_passengers',{user:result});
         console.log(result);
    } )
})
app.get('/search',function(req,res){
   connection.query('SELECT * FROM train ',(error,result)=>{
    if(error){
        throw error;
    }
    else{
        res.render('train',{user1:result});
    }
   })
})
app.get('/book/:user1id',function(req,res){
    const user1id=req.params.user1id;
   
    connection.query('SELECT * FROM train WHERE id= ?',[user1id],(error,result)=>{
        if(error){
            throw error;
        }
        // console.log(user1id)
         res.render('book',{user2:result[0]});
    })
    // res.send('hello');
    
})
app.post('/book',function(req,res){
    const{fname,lname,age,phone_no,train_id,seat_type}=req.body;
    const user1id=req.params.user1id;
    const random_num= Math.floor((Math.random()+1)*100000);
  connection.query('INSERT INTO booking(id,fname,lname,age,phoneno,seat_type,train_id,pnr_no,owner) VALUES(?,?,?,?,?,?,?,?,?)',[null,fname,lname,age,phone_no,seat_type,train_id,random_num,req.session.email],(error,result)=>{
if(error){
    throw error;
}

   

connection.query('INSERT INTO passengers(id,fname,lname,phoneno,owner) VALUES (?,?,?,?,?)',[null,fname,lname,phone_no,req.session.email],(error,result)=>{
    if(error){
        throw error;
    }
    res.render('show_passengers',{user1:result})
    } )

    res.redirect('landing');



  })
})
app.get('/booking',function(req,res){
    connection.query('SELECT * FROM booking WHERE owner=?',[req.session.email],(error,result)=>{
        if(error){
            throw error;
        }
        else{
            res.render('ticket',{user:result})
        }
    })
})
app.get('/pnr',function(req,res){
    res.sendFile(__dirname+"/pnr.html");
})
app.post('/pnr',function(req,res){
    const{pnr_no}=req.body;
    console.log(req.body);
    connection.query("SELECT * FROM booking,train WHERE pnr_no=? And train_no=train_id",[pnr_no],(error,result)=>{
        if(error){
            throw error;
        }
        if(result.length==0){
            res.render('no_result',{user2:req.body});
        }
        
        else{
            res.render('ticket1',{user:result[0]})
        }
        console.log(result);
    })
})
app.post('/',function(req,res){
    const{train_no,source,destination}=req.body;
    connection.query('SELECT * FROM train WHERE source=? AND destination=?',[source,destination],(error,result)=>{
        if(error){
            throw error;
        }
        if(result.length==0){
            res.render('not_available');
        }
        else{
            res.render('train1',{user1:result});
        }
        console.log(result);
    })
})
app.get('/notification',function(req,res){
    connection.query('SELECT * FROM booking WHERE owner=?',[req.session.email],(error,result)=>{
        if(error){
            throw error;
        }
        res.render('notification',{user:result});
    })
})
app.get('/update/:userid',function(req,res){
    const userid=req.params.userid;
    connection.query('SELECT * FROM passengers WHERE id=?',[userid],(error,result)=>{
        if(error){
            throw error;
        }
        res.render('update',{user:result[0]})
    })     
})
app.post('/update',(req,res)=>{
    const{id,fname,lname,phoneno}=req.body;
const sql="UPDATE passengers SET fname='"+req.body.fname+"',lname='"+req.body.lname+"',phoneno='"+req.body.phoneno+"'  WHERE id='"+req.body.id+"'";
    connection.query(sql,(error,result)=>{
        if(error )throw error;
        res.redirect('landing');
    })
})
// app.get('/delete/:userid',function(req,res){
//     const userid=req.body.userid;
//     connection.query('DELETE FROM passengers WHERE id=?',[userid],(error)=>{
//         if(error){
//             throw error;
//         }
//         else{
//             res.send('train')

//         }
        
//     })     
// })
// app.get('/cancel/:userid',function(req,res){
//     const userid=req.body.userid;
//     connection.query('DELETE FROM booking WHERE id=?',[userid],(error)=>{
//         if(error){
//             throw error;
//         }
//         res.redirect('landing')
//     })     
// })
// dcfeb0a437
// 1de80128799070d504d20b35508daa34-us12