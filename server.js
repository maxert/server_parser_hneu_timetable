const express = require('express');
const fs = require('fs')
const cron = require("node-cron");
const group = fs.readFileSync("group.json")
const teacher = fs.readFileSync("teacher.json")
const BaseServer = require("./BaseServer.js");
const app = express()

cron.schedule("20 14 * * *", function () {
    BaseServer.start();
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



app.get("/group", (req, res) => {
    console.log(group);
    res.send(JSON.parse(group));
});

app.get("/teacher", (req, res) => {
    console.log(teacher);
    res.send(JSON.parse(teacher));
});

// start express server on port 5000
app.listen(5000, () => {
    console.log("server started on port 5000");
});