const express = require('express');
const fs = require('fs')
const cron = require("node-cron");
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
const group = fs.readFileSync("group.json")
const teacher = fs.readFileSync("teacher.json")
const BaseServer = require("./BaseServer.js");
const app = express()


app.use(cors({
    origin: true,
    credentials: true
}));
// BaseServer.start();
cron.schedule("24 23 * * *", function () {
    BaseServer.start();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get("/group", (req, res) => {
    console.log(group);
    res.send(JSON.parse(group));
});
app.get("/schedule", async (req, res) => {
    const groupNumber = req.body.groupNumber;
    const studentNumber = req.body.studentNumber;

    const browser = await puppeteer.launch({headless:true,args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    const page = await browser.newPage();
    await Promise.all([
        page.waitForNavigation(),
        page.goto(`http://services.hneu.edu.ua:8081/schedule/schedule?group=${groupNumber}&student=${studentNumber}`)
    ])


    const result = await page.evaluate(() => {
        let data = [];
        let elements = document.querySelectorAll("body>table>tbody>tr");
        elements.forEach((Element, i) => {
            Element.querySelectorAll("#cell").forEach((Number, i) => {
                if (Number.querySelectorAll("#element-table")[0]) {
                    data.push({
                        PARA: parseInt(Number.parentElement.querySelectorAll(".pair")[0].innerText),
                        numberDay: i,
                        info: {
                            title:Number.querySelectorAll("#subject")[0].innerText,
                            lesson:Number.querySelectorAll("#lessonType")[0].innerText,
                            room:Number.querySelectorAll("#room")[0].innerText,
                            teacher:Number.querySelectorAll("#teacher")[0].innerText,
                        }
                    })
                }
            });
        });
        return data;
    });
    console.log(result)

    res.send(result);
    res.status(201).end();
    await browser.close();
});
app.get("/teacher", (req, res) => {
    console.log(teacher);
    res.send(JSON.parse(teacher));
});
const port = process.env.PORT || 3000
// start express server on port 5000
app.listen(port, () => {
    console.log("server started on port 5000");
});