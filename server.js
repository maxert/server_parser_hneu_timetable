const express = require('express');
const fs = require('fs')
const cron = require("node-cron");
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
const group = fs.readFileSync("group.json")
const teacher = fs.readFileSync("teacher.json")
const BaseServer = require("./BaseServer.js");
const app = express();
app.use(cors({
    origin: true,
    credentials: true
}));
function search(obj, predicate) {
    let result = [];
    for (let p in obj) { // iterate on every property
        // tip: here is a good idea to check for hasOwnProperty
        if (typeof (obj[p]) == 'object') { // if its object - lets search inside it
            result = result.concat(search(obj[p], predicate));
        } else if (predicate(p, obj[p]))
            result.push(
                obj
            ); // check condition
    }
    return result;
}
const teacherResult = ()=>{
    for(const element of teacher){
        console.log(element);
    }
}
const resultGroup = search(JSON.parse(group), function (key, value) { // im looking for this key value pair
    return key === 'nameGroup';
});
const uniqueArray = resultGroup.filter((thing, index) => {
    const _thing = JSON.stringify(thing);
    return index === resultGroup.findIndex(obj => {
        return JSON.stringify(obj) === _thing;
    });
});
fs.writeFile('GroupSearch.json', JSON.stringify(uniqueArray, null, 2), (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Saved GroupSearch!')
    }
})


cron.schedule("24 23 * * *", function () {
    BaseServer.start();
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get("/group", (req, res) => {
    res.send(JSON.parse(group));
});

app.get("/search", (req, res) => {

    res.send(resultGroup);
})
app.set('view cache', true);
app.post("/schedule", async (req, res) => {
    const groupNumber = req.body.groupNumber;
    const studentNumber = req.body.studentNumber;
    const WeekNumber = req.body.WeekNumber;
    const Employee = req.body.EmployeeNumber;

    const browser = await puppeteer.launch({
        headless: true, args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
        ],
    });
    console.log(Employee);
    console.log(WeekNumber);
    console.log(studentNumber);
    console.log(groupNumber);
    const page = await browser.newPage();
    await Promise.all([
        page.waitForNavigation(),
        Employee===undefined?(
        studentNumber !== undefined ? page.goto(`http://services.hneu.edu.ua:8081/schedule/schedule?group=${groupNumber}&week=${WeekNumber}&student=${studentNumber}`) : page.goto(`http://services.hneu.edu.ua:8081/schedule/schedule?group=${groupNumber}&week=${WeekNumber}`)):(page.goto(`http://services.hneu.edu.ua:8081/schedule/schedule?employee=${Employee}&week=${WeekNumber}`))
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
                            title: Number.querySelectorAll("#subject")[0]&&Number.querySelectorAll("#subject")[0].innerText,
                            lesson:Number.querySelectorAll("#lessonType")[0]&& Number.querySelectorAll("#lessonType")[0].innerText,
                            room: Number.querySelectorAll("#room")[0]&&Number.querySelectorAll("#room")[0].innerText,
                            teacher: Number.querySelectorAll("#teacher")[0]&&Number.querySelectorAll("#teacher")[0].innerText,
                            group: Number.querySelectorAll("#group")[0].innerText
                        }
                    })
                }
            });
        });
        return data;
    });


    res.send(result);
    res.status(201).end();

    console.log(result)
    await browser.close();


});
app.get("/teacher", (req, res) => {
    res.send(JSON.parse(teacher));
});
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log("server started on port 3000");
});
app.use(express.static('public'));