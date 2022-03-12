
const puppeteer = require('puppeteer')


const pdf = require('pdfkit');
const fs = require('fs');

let link = 'https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj';
let cTab;


( async function () {
    try {
        let browserOpen = puppeteer.launch({
            headless: false ,
            defaultViewpoint : null,
            args : ['--start-maximized']
        })

        let browserInstance = await browserOpen
        let allTabsArr = await browserInstance.pages()
        cTab = allTabsArr[0]
        await cTab.goto(link)
        await cTab.waitForSelector('h1#title')
        let name = await cTab.evaluate(function(select) {
            return document.querySelector(select).innerText
        }, 'h1#title') // pass- function, or argument of function
        console.log(name)

        let allData = await cTab.evaluate(getData, '#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer')
        console.log(name, allData.noOfVideos, allData.noOfViews)

        // Total video print
        let totalVideos = allData.noOfVideos.split(" ")[0]
        console.log(totalVideos)

        //no of videos of current page
        let cVideoslength = await getVideosLength();
        console.log(cVideoslength);
        while (totalVideos - cVideoslength >= 20) {
            await scrollToBottom()
            cVideoslength = await getVideosLength()
             
            
        }
        let finalList = await getStats();;
        // console.log(finalList)

        // Pdk Create using pdfkit
        let pdfDoc = new pdf
        pdfDoc.pipe(fs.createWriteStream('playlist.pdf'));
        pdfDoc.text(JSON.stringify(finalList));
        pdfDoc.end();


        
        
    } catch (error) {
        console.log(error)
    }

})()




// Get Data - no. of video , no of views etc show
function getData(selector) {
    let allElems = document.querySelectorAll(selector);
    let noOfVideos = allElems[0].innerText;
    let noOfViews = allElems[1].innerText;
    return {
        noOfVideos,
        noOfViews
    }
}


// get total no. of videos fucntion 
async function getVideosLength() {
    let length = await cTab.evaluate(getlength, '#contents #thumbnail #img.style-scope.yt-img-shadow')
    return length
}


// get length of  total  no. of video 
function getlength(durationSelect) {
    let durationElem = document.querySelectorAll(durationSelect ,"#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer")
    return durationElem.length;
}


// Get States 
async function getStats() {
    let list = await cTab.evaluate(getNameAndDuration, '#video-title',"#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer")
    return list;
}


// Scroll To Last 
async function scrollToBottom() {
    await cTab.evaluate(gotoBottom)
    function gotoBottom() {
        window.scrollBy(0, window.innerHeight)
    }
}


// duration Select 

function getlength(durationSelect) {
    let durationElem = document.querySelectorAll(durationSelect)
    return durationElem.length;
}



// Get NAme And Duration 
function getNameAndDuration(videoSelector, durationSelector) {
    let videoElem = document.querySelectorAll(videoSelector)
    let duratonELem = document.querySelectorAll(durationSelector)

    let currentList = []
    for (let i = 0; i < duratonELem.length; i++) {
        let videoTitle = videoElem[i].innerText
        let duration = duratonELem[i].innerText
        currentList.push({ videoTitle, duration })
    }
    return currentList;//array of objects
}





