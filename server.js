//requirement
const express = require("express");
const app = express();
const path = require("path");
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const passport = require("passport");
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('connect-flash');
const multer = require('multer');
const { render } = require("ejs");
const { connect } = require("http2");

// Configure session
app.use(
  session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    }
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Define Passport's local strategy
passport.use(
  new LocalStrategy((username, password, done) => {
    connection.query('SELECT * FROM user WHERE username = ?', [username], (err, results) => {
      if (err) return done(err);
      if (results.length === 0) return done(null, false, { message: 'Incorrect username.' });

      const user = results[0];

      bcrypt.compare(password, user.password, (err, res) => {
        if (res) return done(null, user);
        else return done(null, false, { message: 'Incorrect password.' });
      });
    });
  })
);

//check user id and pass
app.use((req, res, next) => {
  res.locals.errorMessage = req.flash('error');
  next();
});

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  connection.query('SELECT * FROM user WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

// URL data incoder
app.use(express.urlencoded({ extended: true }));

// view & public Paths
app.set("views" , path.join(__dirname, "views"));
app.set(express.static(path.join(__dirname, "public")));
app.set("view engine" , "ejs");
app.use(express.json());
app.use(express.static("public"));
app.use('/uploads', express.static('uploads')); // Serves images
// connecting server with MYsql Database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'movies',
    password: 'Ansh@OCT22'
  });

// port define
let port = 8080; 

// server setup for listning requests
app.listen(port, ()=> {
    console.log(`server listning to port: ${port}`);
});

// routs for website

//Get request for home 
app.get('/home', isAuthenticated, (req, res) => {

  const Query1 = `SELECT * FROM test WHERE genra = 'Action'`;

  const Query2 = `SELECT * FROM test WHERE genra = 'Comady'`;

  const Query3 = `SELECT * FROM user WHERE id = ?`
  id = req.user.id;

  connection.query(Query1, (err, result1) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }


    connection.query(Query2, (err, result2) => {
      if (err) {
        return res.status(500).send('Error fetching products');
      }

      connection.query(Query3, id, (err, result3) => {
        if (err) {
          return res.status(500).send('Error fetching products');
        }
      res.render("home.ejs", { action: result1, comady: result2, userId: req.user.id , user: result3});
      });
    });
  });
});

//route for render upload movie form page
app.get("/upload", (req, res) =>{
  res.render("upload.ejs");
});
 
//route for upload movie details
app.post("/upload/movie", (req, res) => {
  let q = `INSERT INTO test (id, movie_name, genra, url, release_date, ratings, duration) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const results  = req.body;
  data = [results.id, results.movie_name, results.genra, results.url, results.release_date, results.ratings, results.duration ];
  try{
      connection.query(q, data, (err, result) => {
        if(err) throw err;
        res.redirect("/upload/video");
      });
    }
    catch(err) {
    console.log(err);
    }
    
});

//route for render upload movie video form page
app.get("/upload/video", (req, res) =>{
  res.render("video.ejs");
});

//route for upload movie video
app.post('/videos', (req, res) => {
  const results  = req.body;
  
   data = [results.video_id, results.title, results.landscape];

    const q = "INSERT INTO video (video_id, title, landscape) VALUES (?, ?, ?)";
    try{
      connection.query(q, data, (err, result) => {
        if(err) throw err;
        res.redirect("/home"); 
      });
    }
    catch(err) { 
    console.log(err); 
    } 
  });

//route for render about page
app.get("/about", (req, res) =>{
  res.render("about.ejs");
});

//route for search movie in database and render search page
app.get("/search", (req, res) => {
  const searchedMovie = req.query.q;
 
   let q = `SELECT * FROM test WHERE movie_name LIKE ?`;
   try{
       connection.query(q, [searchedMovie], (err, results) => {
         if(err)  throw err;
     res.render("search.ejs", {results});
       });
     }
     catch(err) { 
     console.log(err);
     }
 
});

//route for render movie details page
app.get("/view/:detail", (req, res) => {

  const details = req.params.detail; 
  const Query1 = `SELECT * FROM test WHERE movie_name = ?`;

  const Query2 = 'SELECT landscape FROM video WHERE title = ?';

  const Query3 = 'SELECT * FROM video ';


  connection.query(Query1, details, (err, result5) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }

    connection.query(Query2, details, (err, result6) => {
      if (err) {
        return res.status(500).send('Error fetching products');
      }

      connection.query(Query3, (err, result7) => {
        if (err) {
          return res.status(500).send('Error fetching products');
        }
  
      res.render("view.ejs", { details: result5, background: result6 , list: result7});
    });
   });
  });
});

//route for stream movie and show recomanded movies and render player streaming page
app.get("/streaming/movie/:name", (req, res) => {
 
  const video_name = req.params.name;
  const Query1 = `SELECT * FROM video`;

  const Query2 = 'SELECT title FROM video WHERE title = ?';


  connection.query(Query1, (err, result3) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }


    connection.query(Query2, video_name, (err, result4) => {
      if (err) {
        return res.status(500).send('Error fetching products');
      }

      res.render("streaming.ejs", { movie: result3, list: result4 });
    });
   });
});

//route for render watch later page
app.get("/watch-later", isAuthenticated, (req, res) =>{
  res.render("later.ejs");
});

//route for render tv series main page and retrive data from databse
app.get("/tv", isAuthenticated, (req, res) =>{
  const Query1 = `SELECT * FROM tv WHERE genra = 'Drama'`;

  const Query2 = `SELECT * FROM tv WHERE genra = 'Action'`;


  connection.query(Query1, (err, result1) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }


    connection.query(Query2, (err, result2) => {
      if (err) {
        return res.status(500).send('Error fetching products');
      }


      res.render("tv.ejs", { Drama: result1, Action: result2 });
    });
  });
});


//route for render tv sries upload page
app.get("/tv/upload", (req, res) =>{
  res.render("tvUpload.ejs");
});

//route for upload series in databse
app.post("/tv/uploads", (req, res) => {
  let q = `INSERT INTO tv (id, title, url, landscape, year, rating, duration, genra, discription) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const results  = req.body;
  data = [results.id, results.title, results.url, results.landscape, results.year, results.rating, results.duration, results.genra, results.discription];
  try{
      connection.query(q, data, (err, result) => {
        if(err) throw err;
        res.redirect("/tv");
      });
    }
    catch(err) {
    console.log(err);
    }
    
});

//route for render tv series details page
app.get("/tv/view/:title", (req, res) => {

  const details = req.params.title; 
  const Query1 = `SELECT * FROM tv WHERE title = ?`;

  const Query2 = 'SELECT landscape FROM tv WHERE title = ?';

  const Query3 = 'SELECT * FROM tv ';


  connection.query(Query1, details, (err, result1) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }

    connection.query(Query2, details, (err, result2) => {
      if (err) {
        return res.status(500).send('Error fetching products');
      }

      connection.query(Query3, (err, result3) => {
        if (err) {
          return res.status(500).send('Error fetching products');
        }

      res.render("tvDetails.ejs", { details: result1, background: result2, list:result3});
    });
   });
  });
});

//route for stream series and show recomanded series and render player streaming page
app.get("/streaming/tv/:title", (req, res) => {
 
  const video_name = req.params.title;
  const Query1 = `SELECT * FROM tv`;

  const Query2 = 'SELECT title FROM tv WHERE title = ?';


  connection.query(Query1, (err, result1) => {
    if (err) {
      return res.status(500).send('Error fetching users');
    }


    connection.query(Query2, video_name, (err, result2) => {
      if (err) {
        return res.status(500).send('Error fetching products');
      }

      res.render("tvStreaming.ejs", { series: result1, list: result2 });
    });
   });
});

//route for search series in database and render tvsearch page
app.get("/search/tv", (req, res) => {
  const searchedMovie = req.query.q;
 
   let q = `SELECT * FROM tv WHERE title LIKE ?`;
   try{
       connection.query(q, [searchedMovie], (err, results) => {
         if(err)  throw err;
     res.render("tvSearch.ejs", {results});
       });
     }
     catch(err) { 
     console.log(err);
     }
 
});

//route to render signup page 
app.get("/register", checkNotAuthenticated, (req, res)=> {
   res.render("signup.ejs");
}); 

//route to add user data into the databse
app.post("/register", async  (req, res)=>{
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  userData =[ Date.now().toString(), req.body.username, req.body.email, hashedPassword];
  q = 'INSERT INTO user (id, username, email, password) VALUES (?, ?, ?, ?)';

   console.log(userData);
  try{
    connection.query(q, userData, (err, results) => {
      if(err)  throw err;
      res.redirect("/signin")
    });
  }
  catch(err) { 
    res.redirect("/register")
  console.log(err);  
  }
});

//route to render signin page 
app.get("/signin", checkNotAuthenticated, (req, res)=> {
  res.render("signin.ejs");
});

//route to search user data into the databse
app.post('/signin', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/signin',
  failureFlash: true
}));

//route for logout from website
app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/signin');
  });
});

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/home');
  }
  next();
}

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/signin');
}

//route for render user profile page
app.get("/profile/:user" , (req, res) => {
  const userId = req.params.user;
  q = 'SELECT * FROM user WHERE id = ?'
  connection.query(q, userId, (err, results) => {
      if (err) throw err;
      res.render("userProfile.ejs", { user: results , userId });
  });
});

app.post('/profile/update/:id', (req, res) => {
  const userId = req.params.id;
  const { username, email,} = req.body;
  q = 'UPDATE user SET username = ?, email = ? WHERE id = ?'
  connection.query(q,[username, email, userId], (err) => {
          if (err) throw err;
          res.redirect(`/profile/${userId}`);
      }
  );
});

app.post('/profile/update/password/:id', async (req, res) => {
  const userId = req.params.id;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  q = 'UPDATE user SET password = ? WHERE id = ?'

  connection.query(q, [hashedPassword , userId] , (err) => {
          if (err) throw err;
          res.redirect(`/profile/${userId}`);
      }
  );
});

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save images to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
  }
});

const upload = multer({ storage: storage });

app.post("/profile/:id/upload", upload.single('profileImage'), (req, res) => {
  const userId = req.params.id;
  const imagePath = `/uploads/${req.file.filename}`;
  q = 'UPDATE user SET profile_image = ? WHERE id = ?'
  connection.query(q, [imagePath, userId], (err) => {
    if (err) throw err;
    res.redirect(`/profile/${userId}`);
  });
}); 