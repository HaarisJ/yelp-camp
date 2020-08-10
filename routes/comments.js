const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");


//Comments New
router.get('/new', middleware.isLoggedIn, (req, res) => {
    //find campground by id, and send it to the template,
    //so we can we use it to send form to the right post req
    Campground.findById(req.params.id, (err, foundCG) => {
        if(err){
            console.log(err);
        } else {
            res.render('comments/new', {campground: foundCG});
        }
    });
});

//Comments Create
router.post('/', middleware.isLoggedIn, (req, res) => {
    //find campground
    Campground.findById(req.params.id, (err, foundCG) => {
        if(err){
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            //create comment
            Comment.create(req.body.comment, (err, comment) => {
                if(err){
                    console.log(err);
                } else {
                    //add username and id to comment and save comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    foundCG.comments.push(comment);
                    foundCG.save();
                    //redirect to show page
                    req.flash("success", "Successfully Added Comment");
                    res.redirect('/campgrounds/' + foundCG._id);
                }
            });
        }
    });
});

//Edit comment route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCG) => {
        if(err || !foundCG){
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if(err){
                res.redirect("back");
            } else {
                // instead of sending entire campground object, send only id from req.params
                res.render("comments/edit", {comment: foundComment, campground_id: req.params.id});
            }
        });
    });
});

//Update comment route
router.put("/:comment_id", middleware.checkCommentOwnership, (req ,res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,(err, updatedComment) => {
        if(err || !updatedComment){
            console.log(err);
            res.redirect("back");
        } else {
            // redirect to show page
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//Destroy comment route
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, (err) => {
        if(err){
            res.redirect("back");
        }
        req.flash("success", "Comment Deleted");
        res.redirect("back");
    });
});

//Destroy all comments on campground destroy
router.delete("/", (req, res) => {
    Campground.findById(req.params.id, middleware.isLoggedIn, (err, foundCG) => {
        if(err) {
            res.redirect("/campgrounds");
        } else {
            Comment.deleteMany({_id: {$in: foundCG.comments}}, (err) => {
                if(err){
                    console.log(err);
                }
                res.redirect("/campgrounds");
            });
        }
    });
});

module.exports = router;