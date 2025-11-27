const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const fs = require('fs')

const app = express()
const port = 3000

app.use(express.static('public'));


app.use(bodyParser.urlencoded({extended:true}))

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}))

app.set('view engine','ejs')

// loading users from file
let users = []
if (fs.existsSync('users.json')) {
    users = JSON.parse(fs.readFileSync('users.json'))
}


// routes
app.get("/",(req,res)=> {
    if (req.session.username) {
        res.redirect('/welcome')
    } else {
        res.redirect('/login')
    }
})

app.get('/register',(req,res)=>{
    res.render('register',{message:''})
})

app.post('/register',(req,res)=>{
    const {username,password} = req.body
    if (users.find(u => u.username === username)) {
        return res.render('register',{message:"Username already exist"})
    }

    const hashedPassword = bcrypt.hashSync(password,8)
    users.push({username, password: hashedPassword})
    fs.writeFileSync('users.json',JSON.stringify(users,null,2))
    res.redirect('/login')
})

app.get('/login',(req,res)=> {
    res.render('login',{message:''})
})

app.post('/login',(req,res)=>{
    const {username,password} = req.body
    const user = users.find(u=> u.username ===username)
    if (!user) {
        return res.render('login',{message:'User not found'})
    }
    const valid = bcrypt.compareSync(password,user.password)
    if (!valid) {
        return res.render('login',{message : 'Incorrect password'})
    }
    req.session.username = username;
    res.redirect('/welcome')
})

app.get('/welcome',(req,res)=>{
    if(!req.session.username) return res.redirect('/login')
    res.render('welcome',{username : req.session.username})
})

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


app.listen(port, ()=> 
    console.log(`Server running on http://localhost:${port}`)
)