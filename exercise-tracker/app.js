// Node Modules.
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Custom Modules.
const User = require("./models/User");
const Exercise = require("./models/Exercise");

// Initializations.
const app = express();
const port = 4000;
dotenv.config();
mongoose
  .connect(
    process.env.MONGO_URI,
    { useNewUrlParser: true },
  )
  .then(
    () => console.log("Database is successfully connected."),
    err => console.log("Connection with database is failed.", err),
  );

//Middlewares.
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded.

// Check for database connection
app.use((req, res, next) => {
  if (!mongoose.connection.readyState) {
    res.json({
      error: true,
      msg: "Connection with database is terminated.",
    });
  }
  next();
});

// Show main index page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/index.html"));
});

// Add User
app.post("/api/exercise/new-user", (req, res) => {
  let username = req.body.username;

  if (!username) {
    return res.json({
      success: false,
      msg: "Username is required",
    });
  }

  let user = new User({ username: username });

  user.save((err, new_user) => {
    if (err) {
      console.log(err);

      if (err.code == 11000) {
        // uniqueness error (no custom message)
        return res.json({
          error: true,
          message: "Username already taken",
        });
      }

      return res.json({
        error: true,
        msg: "Error occured while saving data",
      });
    }

    return res.json({
      username: new_user.username,
      _id: new_user._id,
    });
  });
});

// Add Exercise
app.post("/api/exercise/add", (req, res) => {
  let exercise = {
    username: req.body.username,
    description: req.body.description,
    duration: parseInt(req.body.duration),
    date: !req.body.date ? new Date() : new Date(req.body.date),
  };

  // Validatiosn of username, descriptin and duration as they are required.
  if (!exercise.username) {
    return res.json({
      success: false,
      msg: "Username is required.",
    });
  } else if (!exercise.description) {
    return res.json({
      success: false,
      msg: "Description is required and must be a valid string.",
    });
  } else if (!exercise.duration) {
    return res.json({
      success: false,
      msg: "Duration is required and must be a valid number.",
    });
  }

  console.log(exercise);
  // Validation of Date
  if (exercise.date == "Invalid Date") {
    return res.json({
      success: false,
      msg: "Date must be a valid date.",
    });
  }

  User.findOne({ username: exercise.username }, (err, data) => {
    if (err) {
      console.log(err);
      res.json({
        error: true,
        msg: "Error while validating user",
      });
    }

    if (data === null) res.json({ error: true, msg: "User does not exists." });

    let exerciseToSave = new Exercise(exercise);

    exerciseToSave.save((err, savedExercise) => {
      if (err) {
        console.log(err);
        res.json({
          error: true,
          msg: err.message,
        });
      }

      savedExercise = savedExercise.toObject();
      savedExercise.date = new Date(savedExercise.date).toDateString();

      delete savedExercise.__v;
      delete savedExercise._id;

      res.json(savedExercise);
    });
  });
});

// Show all available users
app.get("/api/exercise/users", (req, res) => {
  User.find({}, (err, users) => {
    if (err) {
      console.log(err);
      res.json({
        error: true,
        msg: "Error occured while searching for users.",
      });
    }

    res.json(users);
  });
});

// Get Log
app.get("/api/exercise/log", (req, res) => {
  let conditions = {};

  // Validation of Username
  if (!req.query.username) {
    return res.json({
      success: false,
      msg: "Username is required.",
    });
  } else {
    conditions["username"] = req.query.username;
  }

  // Validation of Limit
  if (req.query.limit) {
    let limit = parseInt(req.query.limit);
    if (limit) {
      conditions["limit"] = limit;
    } else {
      return res.json({
        success: false,
        msg: "Limit must me a valid integer.",
      });
    }
  }

  // Validation of From Date
  if (req.query.from) {
    try {
      conditions["from"] = new Date(req.query.from);

      if (conditions.from == 'Invalid Date') {
        return res.json({
          success: false,
          msg: "Enter valid from date.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Validation of To Date
  if (req.query.to) {
    try {
      conditions["to"] = new Date(req.query.to);
      
      if (conditions.to == 'Invalid Date') {
        return res.json({
          success: false,
          msg: "Enter valid to date.",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  User.findOne({ username: conditions.username }, (err, user) => {
    if (err) {
      console.log(err);

      return res.json({
        error: true,
        msg: "Error occured while saving data.",
      });
    }

    if (!user) {
      return res.json({
        error: true,
        msg: "User doesn't exists.",
      });
    }

    Exercise.find({
      username: conditions.username,
      date: {
        $gte: conditions.from ? conditions.from : 0,
        $lte: conditions.to ? conditions.to : new Date(),
      },
    })
      .sort("-date")
      .limit(conditions.limit)
      .exec((err, exercises) => {
        if (err) {
          console.log(err);
          res.json({
            error: true,
            msg: "Error occured while looking for exercises.",
          });
        }

        res.json({
          userId: user._id,
          username: user.username,
          count: exercises.length,
          from: conditions.from ? conditions.from.toDateString() : undefined,
          to: conditions.to ? conditions.to.toDateString() : undefined,
          log: exercises.map(e => ({
            description: e.description,
            duration: e.duration,
            date: new Date(e.date).toDateString(),
          })),
        });
      });
  });
});

// Page not Found.
app.use((req, res) => {
  res.send("Page Not Found.");
});

// Listening to port
app.listen(port, () => console.log(`Listening to port: ${port}`));
