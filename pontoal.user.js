// ==UserScript==
// @name         Pontoal
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Script to remember the user to register the time on the company online time register
// @author       Cristian Macedo
// @include      *
// @exclude      http://portalhoras.stefanini.com*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_openInTab
// ==/UserScript==

let initSchedule = {
    "e1": {
        "time": "00:00",
        "marked": false
    },
    "s1": {
        "time": "00:00",
        "marked": false
    },
    "e2": {
        "time": "00:00",
        "marked": false
    },
    "s2": {
        "time": "00:00",
        "marked": false
    }
}

function getHoursInput(msg, entries){

    let res = []
    let input = ""

    entries.forEach(entry => {
        while(input.match(/^(([2][0-3]|[01]?[0-9])([.:][0-5][0-9]))?$/) == null || input == ""){
            input = getInput(msg.replace('{}', entry))
        }
        res.push(input)
        input = ""
    });

    return res

}

function getInput(msg) {
    return prompt(msg)
}

function openInNewTab(url) {
    GM_openInTab(url);
}

function resetMarks(object) {
    for (let key in object) {
        object[key].marked = false
    }
    return object;
}

function confMark(mark) {
    let res = confirm(`Have you marked: ${mark}? (OK = Yes - Cancel = No)`)
    return res
}

function compareHours(h1, h2) {
    let res = Date.parse(h1) < Date.parse(h2)
    return res
}

function fillZero(length, number) {
    return number.toString().padStart(length, "0");
}

function init(){

    // Will be executed only on the first use of the script
    if (!GM_getValue('first')) {

        alert('Thanks for using the Pontoal tool.\r\n\r\nThis is the wizard setup, please input the hours you want\r\nthe alerts to appear on the next windows.')

        // Getting time inputs from user
        let scheduleTimes = getHoursInput('Please insert the {} time (HH:MM)', ['Entrada 1', 'Saída 1', 'Entrada 2', 'Saída 2'])
        //let markWebsite = getInput('Please insert the Company Website url (http(s)://*.*.*)')
        let markWebsite = "http://portalhoras.stefanini.com/"
        
        // Replace times on the initSchedule
        let i = 0
        for (let key in initSchedule) {
            initSchedule[key].time = scheduleTimes[i]
            i++
        }

        GM_setValue('markWebsite', markWebsite)
        GM_setValue('schedule', initSchedule);
        GM_setValue('lastDay', -1);
        GM_setValue('first', true);
    }

    // Retrieving cached variables
    let schedule = GM_getValue('schedule')
    let lastDay = GM_getValue('lastDay')

    // Getting the current date info
    let currentDate = new Date();
    let currentDay = currentDate.getDay()
    let currentTime = "01/01/2000 " + fillZero(2, currentDate.getHours()) + ":" + fillZero(2, currentDate.getMinutes()) + ":00"

    // If a day has passed, then reset all the marks.marked to "false"
    if(lastDay != currentDay){
        schedule = resetMarks(schedule);
    }

    for (let key in schedule) {

        let mark = schedule[key]
        let formatedTime = "01/01/2000 " + mark.time + ":00"
        let isTime = compareHours(formatedTime, currentTime)
        let isMarked = mark.marked

        if(isTime && !isMarked){
            let conf = confMark(mark.time)
            if (conf) mark.marked = true
            else openInNewTab(GM_getValue('markWebsite'))
        }

    }

    // Update cached variables
    GM_setValue('lastDay', currentDay)
    GM_setValue('schedule', schedule)
}

setTimeout(() => {
    if(top == self){
        init()
    }
}, 5000);
