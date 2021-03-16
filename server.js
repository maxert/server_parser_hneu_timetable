const express = require('express');
const fs = require('fs')
const cron = require("node-cron");
const puppeteer = require('puppeteer');
const group = fs.readFileSync("group.json")
const teacher = fs.readFileSync("teacher.json")
const BaseServer = require("./BaseServer.js");
const app = express()
BaseServer.start();
// cron.schedule("24 23 * * *", function () {
//     BaseServer.start();
// });

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});



app.get("/group", (req, res) => {
    console.log(group);
    res.send(JSON.parse(group));
});
app.post("/schedule", async ( req, res) => {
    if(!req.body) return res.sendStatus(400);
    console.log(req.body);
    // const browser = await puppeteer.launch({headless: true});
    // const page = await browser.newPage();
    //
    // await page.goto('http://services.hneu.edu.ua:8081/schedule/selection.jsf');
    //
    // const result = await page.evaluate(() => {
    //     let data = [];
    //     let elements = document.querySelectorAll("body>table>tbody>tr");
    //
    //
    //     elements.forEach((Element,i)=>{
    //         Element.querySelectorAll("#cell").forEach((Number,i)=>{
    //             if(Number.querySelectorAll("#element-table")[0]){
    //                 data.push({PARA:parseInt(Number.parentElement.querySelectorAll(".pair")[0].innerText),numberDay:i})
    //             }
    //         });
    //     });
    //     return data;
    // });
    //
    //
    // res.send(result);
});
app.get("/teacher", (req, res) => {
    console.log(teacher);
    res.send(JSON.parse(teacher));
});
const port = process.env.PORT||3000
// start express server on port 5000
app.listen(port, () => {
    console.log("server started on port 5000");
});