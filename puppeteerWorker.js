const {parentPort, workerData} = require("worker_threads");
const puppeteer = require('puppeteer');
const filer = require('fs');
let adsCollection =[]; // All the Ads in This Collection
let uniqueAds ={};    // Only Ads with distinct body

//let exPath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrmome.exe'

(async () => {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    page.on("response",async (response)=>{
        let ad=[]
        if(JSON.stringify(await response.url()).includes("https://www.facebook.com/ads/library/async/search_ads/")){
          temp = [...JSON.parse((await response.text()).toString().replace("for (;;);","")).payload.results]
          adsCollection.push(...JSON.parse((await response.text()).toString().replace("for (;;);","")).payload.results)
          temp.forEach((ite)=>{
            ad.push(ite[0])
          })
          filer.writeFile('./response.txt', JSON.stringify(ad),()=>{
           console.log('file is respnse')
          });
          
        ad.forEach((item)=>{
          if(!item.snapshot.body){
            return
          }
          if(!item.snapshot.body.markup){
            return
          }
          if(!item.snapshot.body.markup.__html){
            return
          }
          if(!uniqueAds[item.snapshot.body.markup.__html]){
            uniqueAds[item.snapshot.body.markup.__html] = {count:0,sent:false}
            return
          }
            uniqueAds[item.snapshot.body.markup.__html].count = uniqueAds[item.snapshot.body.markup.__html].count +1
          
          
        })

        console.log('total ads ====>', adsCollection.length)
        console.log("Unique Ads ====>",Object.keys(uniqueAds).length)
        console.log(uniqueAds)
            
      
        }
    })

   
    await page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=free%20shipping&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all');
    await page.setViewport({
        width: 1200,
        height: 800
    })
    await page.evaluate(() => {
        let elements = document.getElementsByClassName('_8n_3');
        console.log(elements)
        for (let element of elements)
            element.click();
    });
    
    
    while(true){
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        //await page.waitForTimeout(1000);
        console.log('scroll hit')
    }

    //await browser.close();
  })();


async function scrapeItems(
    page,
    extractItems,
    itemCount,
    scrollDelay = 800,
  ) {
    let items = [];
    try {
      let previousHeight;
      while (items.length < itemCount) {
        //items = await page.evaluate(extractItems);
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitForTimeout(scrollDelay);
      }
    } catch(e) { }
    return items;
  }