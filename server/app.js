require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db/conn")
const PORT = 6005;
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const userdb = require("./model/userSchema")

const clientid = "105591079051-hdtr8v5sflk6chdh7102l23f8puvisti.apps.googleusercontent.com"
const clientsecret = "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"


app.use(
    cors({
        origin: "*", // Replace with your React app's URL
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        // Enable credentials (cookies, HTTP authentication)
    })
);


app.use(express.json());



// setup session
app.use(session({
    secret: "sakemaru",
    resave: false,
    saveUninitialized: true
}))

// setuppassport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new OAuth2Strategy({
        clientID: clientid,
        clientSecret: clientsecret,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                let user = await userdb.findOne({ googleId: profile.id });

                if (!user) {
                    user = new userdb({
                        googleId: profile.id,
                        displayName: profile.displayName,
                        email: profile.emails[0].value,
                        image: profile.photos[0].value
                    });

                    await user.save();
                }


                return done(null, user)
            } catch (error) {
                return done(error, null)
            }
        }
    )
)

passport.serializeUser((user, done) => {
    done(null, user);
})

passport.deserializeUser((user, done) => {
    done(null, user);
});

// initial google ouath login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get('/auth/google/callback',
    passport.authenticate('google', { scope: ['profile', 'email'] }),
    (req, res) => {
        if (req.user) {
            const userData = {
                id: req.user._id,
                displayName: req.user.displayName,
                email: req.user.email,
                image: req.user.image
                // Add other necessary user data
            };

            const userDataString = JSON.stringify(userData);

            // Set a cookie named 'sakemaru' with user data
            res.cookie('sakemaru', userDataString, { maxAge: 3000000 });

            res.redirect('http://localhost:3000/home');
        } else {
            res.redirect('http://localhost:3000');
        }
    }
);

app.get("/login/sucess", async (req, res) => {

    if (req.user) {
        res.status(200).json({ message: "user Login", user: req.user })
    } else {
        res.status(400).json({ message: "Not Authorized" })
    }
})


app.get('/logout', (req, res, next) => {

        req.logout(function (err) {
            if (err) { return next(err); }
        });

    res.redirect('http://localhost:3000');
});


app.listen(PORT, () => {
    console.log(`server start at port no ${PORT}`)
})