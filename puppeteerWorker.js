const {parentPort, workerData} = require("worker_threads");
const puppeteer = require('puppeteer');
const fetch =require('cross-fetch');
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
          // filer.writeFile('./response.txt', JSON.stringify(ad),()=>{
          //  console.log('file is respnse')
          // });
         // console.log(adsCollection)
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
            let Url="No URL"
            if(item.snapshot.cards.length>0){
              Url=item.snapshot.cards[0].original_image_url;
              console.log("imgUrl------>",Url);
             // uniqueAds[item.snapshot.body.markup.__html] = {count:1,sent:false,url:Url}
            }
            else if(item.snapshot.images.length>0){
              Url=item.snapshot.images[0].original_image_url;
              console.log("imgUrl------>",Url);
              //uniqueAds[item.snapshot.body.markup.__html] = {count:1,sent:false,url:Url}

            }
            else if(item.snapshot.videos.length>0){
              if(item.snapshot.videos[0].video_sd_url!=null)
              Url=item.snapshot.videos[0].video_sd_url;   
              else
              Url=item.snapshot.videos[0].video_hd_url;
              console.log("Video URL------>",Url);
              //uniqueAds[item.snapshot.body.markup.__html] = {count:1,sent:false,url:Url}
            }
       
            uniqueAds[item.snapshot.body.markup.__html] = {count:1,sent:false,url:Url}
          
           //img:item.snapshot.cards[0].original_image_url
            // console.log("img--->",item.snapshot.cards)
            return
          }

          if(item.snapshot.cards.length>0){
            uniqueAds[item.snapshot.body.markup.__html].url=item.snapshot.cards[0].original_image_url;
          }
          else if(item.snapshot.images.length>0){
            uniqueAds[item.snapshot.body.markup.__html].url=item.snapshot.images[0].original_image_url;
          }
          else if(item.snapshot.videos.length>0){
            if(item.snapshot.videos[0].video_sd_url!=null)
            uniqueAds[item.snapshot.body.markup.__html].url=item.snapshot.videos[0].video_sd_url;   
            else
            uniqueAds[item.snapshot.body.markup.__html].url=item.snapshot.videos[0].video_hd_url;
          }
          uniqueAds[item.snapshot.body.markup.__html].count = uniqueAds[item.snapshot.body.markup.__html].count +1
            
            

           // console.log(item.snapshot.body);
     
        })

        // console.log('total ads ====>', adsCollection.length)
        // console.log("Unique Ads ====>",Object.keys(uniqueAds).length)
        for (const key in uniqueAds) {
          if(uniqueAds[key].count>2 && !uniqueAds[key].sent)//yaha par count set hoga user k acc
          {
            addpost({caption:key,url:uniqueAds[key].url});
            uniqueAds[key].sent=true;
          }
        }
        // uniqueAds.forEach((elem,index)=>{
        //   if(elem.count==5){
              
        //       uniqueAds.splice(index,1);
        //   }
        // })
        // console.log(uniqueAds)
            
      
        }
    })

   
    await page.goto('https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=free%20shipping&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all');
    await page.setViewport({
        width: 1200,
        height: 800
    })
    await page.evaluate(() => {
        let elements = document.getElementsByClassName('_8n_3');
        //console.log(elements)
        for (let element of elements)
            element.click();
    });
    
    
    while(true){
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        //await page.waitForTimeout(1000);
   //     console.log('scroll hit')
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

  function addpost(body) {
    fetch("http://34.212.153.91:8082/addpost", {
      method: 'post',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
     
  })
  .then(response => response.text())

  .then(response => {
      console.log(response)
  })
  .catch(err=>{
    console.log(err)
  })

  
  }