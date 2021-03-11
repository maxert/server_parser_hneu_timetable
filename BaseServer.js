const puppeteer = require('puppeteer');
const fs = require('fs')

module.exports = {
    start: function () {
        const scrape = async () => {
            const browser = await puppeteer.launch({headless: true});
            const page = await browser.newPage();
            await page.goto('http://services.hneu.edu.ua:8081/schedule/selection.jsf');


            const result = await page.evaluate(() => {
                let data = [];
                let elements = document.querySelectorAll('select.select');

                for (const element of elements) {
                    let valueName = [];
                    let title = element.id;
                    let elemVal = element.querySelectorAll('option');
                    elemVal.forEach(element => {
                        valueName.push({value: element.value, name_schedule: element.innerHTML})
                    })
                    data.push({title, valueName});
                }
                return data;
            });

            for (const elementFuck in result) {
                for (const elemVal of result[elementFuck].valueName) {

                    await page.select("#group-form\\:faculty", elemVal.value);
                    await page.waitFor(50);
                    const click = await page.evaluate(() => {
                        let data = [];
                        let elements = document.querySelectorAll(`select#group-form\\:speciality option`); // Выбираем все товары
                        elements.forEach(element => {
                            data.push({value: element.value, name: element.innerHTML})
                        })
                        return data;
                    })
                    elemVal.facultet = click;
                    for (const facultet of elemVal.facultet) {
                        await page.select("#group-form\\:speciality", facultet.value);
                        await page.waitFor(50);
                        const click = await page.evaluate(() => {
                            let data = [];
                            let elements = document.querySelectorAll(`select#group-form\\:course option`); // Выбираем все товары
                            elements.forEach(element => {
                                data.push({number: element.value})
                            })
                            return data;
                        })
                        facultet.course = click;
                        for (const group of facultet.course) {
                            await page.select("#group-form\\:course", group.number);
                            await page.waitFor(50);
                            const click = await page.evaluate(() => {
                                let data = [];
                                let elements = document.querySelectorAll(`select#group-form\\:group option`); // Выбираем все товары
                                elements.forEach(element => {
                                    data.push({value: element.value, name: element.innerHTML})
                                })
                                return data;
                            })
                            group.group = click;

                            for (const student of group.group) {
                                await page.select("#group-form\\:group", student.value);
                                await page.waitFor(50);
                                const click = await page.evaluate(() => {
                                    let data = [];
                                    let elements = document.querySelectorAll(`select#group-form\\:student option`); // Выбираем все товары
                                    elements.forEach(element => {
                                        data.push({value: element.value, name: element.innerHTML})
                                    })
                                    return data;
                                })
                                student.student = click;
                                console.log(student)
                            }

                        }


                    }


                }

            }
            await page.click('#teacher-tab_cell')
            const resultTeacher = await page.evaluate(() => {
                let data = [];
                let elements = document.querySelectorAll('select.select');

                for (const element of elements) {
                    let valueName = [];
                    let title = element.id;
                    let elemVal = element.querySelectorAll('option');
                    elemVal.forEach(element => {
                        valueName.push({value: element.value, name_schedule: element.innerHTML})
                    })
                    data.push({title, valueName});
                    for (const element of elements) {
                        let valueName = [];
                        let title = element.id;
                        let elemVal = element.querySelectorAll('option');
                        elemVal.forEach(element => {
                            valueName.push({value: element.value, name_schedule: element.innerHTML})
                        })
                        data.push({title, valueName});
                    }
                }
                return data;
            });

            for (const resultTeacherList of resultTeacher[6].values) {
                await page.select("#teacher-form\\:department", resultTeacherList.value);
                await page.waitFor(50);
                const click = await page.evaluate(() => {
                    let data = [];
                    let elements = document.querySelectorAll(`select#teacher-form\\:employee option`); // Выбираем все товары
                    elements.forEach(element => {
                        data.push({value: element.value, name: element.innerHTML})
                    })
                    return data;
                })
                resultTeacherList.name_teacher = click;
            }

            browser.close();
            return {
                group_student: result,
                teacher: resultTeacher[6]
            }
        }
        scrape().then((value) => {
            fs.writeFile('group.json', JSON.stringify(value.group_student, null, 2), (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Saved Group!')
                }
            })
            fs.writeFile('teacher.json', JSON.stringify(value.teacher, null, 2), (err) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log('Saved Teacher!')
                }
            })
        })
    }
}
