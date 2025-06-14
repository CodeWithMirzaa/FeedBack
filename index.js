import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import fs from "fs";

const app = express();
const port = 3000;
const DATA_FILE = path.join(__dirname, "data", "feedbacks.json");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");

function loadFeedbacks() {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
  }

  function saveFeedback(feedback) {
    const feedbacks = loadFeedbacks();
    feedbacks.unshift(feedback);
    fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2));
  }

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/submit", (req, res) => {
    const { name, message } = req.body;
    if (!message.trim()) {
      return res.send("Message is required. <a href='/'>Go back</a>");
    }
  
    const feedback = {
      name: name || "Anonymous",
      message,
      date: new Date().toLocaleString(),
    };
  
    saveFeedback(feedback);
    res.redirect("/feedbacks");
  });
  
  app.get("/feedbacks", (req, res) => {
    const feedbacks = loadFeedbacks();
    res.render("feedbacks.ejs", { feedbacks });
  });

  app.post("/delete/:index", (req, res) => {
    const index = parseInt(req.params.index);
    let feedbacks = loadFeedbacks();
  
    if (!isNaN(index) && index >= 0 && index < feedbacks.length) {
      feedbacks.splice(index, 1); // remove the feedback at that index
      fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2));
    }
  
    res.redirect("/feedbacks");
  });

  app.get("/edit/:index", (req, res) => {
    const index = parseInt(req.params.index);
    const feedbacks = loadFeedbacks();
  
    if (!isNaN(index) && index >= 0 && index < feedbacks.length) {
      const feedback = feedbacks[index];
      res.render("edit", { feedback, index });
    } else {
      res.redirect("/feedbacks");
    }
  });
  app.post("/edit/:index", (req, res) => {
    const index = parseInt(req.params.index);
    const feedbacks = loadFeedbacks();
  
    if (!isNaN(index) && index >= 0 && index < feedbacks.length) {
      feedbacks[index] = {
        name: req.body.name || "Anonymous",
        message: req.body.message,
        date: new Date().toLocaleString()
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(feedbacks, null, 2));
    }
  
    res.redirect("/feedbacks");
  });

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });