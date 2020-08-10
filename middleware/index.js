const Campground = require("../models/campground");
const Comment = require("../models/comment");
// all the middleware goes here
const middlwareObj = {};

middlwareObj.checkCampgroundOwnership = (req, res, next) => {
    // is user logged in?
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCG) => {
            // Check if error, or if foundCG is null
            if(err || !foundCG){
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                // does user own the post?
                // need to use .equals bcuz foundCG.author.id is mongoose object
                if(foundCG.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        })
    } else{ 
        res.redirect("back");
    }
}

middlwareObj.checkCommentOwnership = (req, res, next) => {
    // is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err || !foundComment){
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                // does user own the comment?
                // need to use .equals bcuz foundComment.author.id is mongoose object
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        })
    } else{ 
        req.flash("error", "Please Login First");
        res.redirect("back");
    }
}

middlwareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First");
    res.redirect("/login");
}

module.exports = middlwareObj;