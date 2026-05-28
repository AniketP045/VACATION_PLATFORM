const User = require("../models/user.js");

module.exports.getSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
};

module.exports.getSignedUp = async (req,res,next)=>{
    try {
        let {username,email,password }= req.body;
        const newUser = new User({email,username});
        const registerdUser = await User.register(newUser, password);
        console.log(registerdUser);
        req.login(registerdUser,(err)=>{
            if(err){
               return next(err);
            }
            req.flash("success", "Welcome to StayNest");
            res.redirect("/listings");
        });
        
    } catch (e) {
        req.flash("error",e.message);
    }
    
};

module.exports.getLoginForm = (req,res)=>{
    res.render("users/login.ejs");
};

module.exports.getLoggedIn =(req,res)=>{
    req.flash("success", "Welcome back to StayNest");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.getLoggedOut =(req,res,next)=>{
    req.logout((err)=>{
        if(err){
           return next(err);
        }
        req.flash("success","you are logged out");
        res.redirect("/listings");
    });
};

