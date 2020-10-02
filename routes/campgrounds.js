const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");

//INDEX (displays all campgrounds)
router.get("/", function (req, res) {
  //Get all campgrounds from DB
  Campground.find({}, (err, campgrounds) => {
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", { campgrounds: campgrounds });
    }
  });
});

//NEW (take us to the form)
router.get("/new", middleware.isLoggedIn, function (req, res) {
  res.render("campgrounds/new");
});

//CREATE (creates the object and inserts into DB)
router.post("/", middleware.isLoggedIn, function (req, res) {
  //get data from form and add to campgrounds array
  const name = req.body.name;
  const image = req.body.image;
  const desc = req.body.description;
  const price = req.body.price;
  const rating = req.body.rating;
  const author = {
    id: req.user._id,
    username: req.user.username,
  };
  let newCampground = {
    name: name,
    image: image,
    description: desc,
    author: author,
    price: price,
    rating: rating,
  };
  //Create a new campground and save to DB
  Campground.create(newCampground, (err, newlyCreated) => {
    if (err) {
      console.log(err);
    } else {
      //redirect to campgrounds page
      res.redirect("/campgrounds");
    }
  });
});

//SHOW (shows more info about one campground)
router.get("/:id", (req, res) => {
  // find the campground with the provided ID
  Campground.findById(req.params.id)
    .populate("comments")
    .exec((err, foundCG) => {
      if (err || !foundCG) {
        req.flash("error", "Campground not found");
        res.redirect("back");
      } else {
        // render the show template
        res.render("campgrounds/show", { campground: foundCG });
      }
    });
});

//EDIT ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCG) => {
    res.render("campgrounds/edit", { campground: foundCG });
  });
});

//UPDATE ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  //find and update the campground
  Campground.findByIdAndUpdate(
    req.params.id,
    req.body.campground,
    (err, updatedCG) => {
      if (err) {
        res.redirect("/campgrounds");
      } else {
        //redirect to the show page
        req.flash("success", "Succesfully Edited Campground.");
        res.redirect("/campgrounds/" + req.params.id);
      }
    }
  );
});

//DESTROY ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndDelete(req.params.id, (err) => {
    if (err) {
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds");
    }
  });
});

module.exports = router;
