const express = require('express');
const cors = require('cors');

const students = require('./routes/studentsroutes');

const tiktokDL = require('./src/tiktokDL');

const fs = require('fs');
const axios = require('axios');

var clc = require("cli-color");

const app = express();

const dotenv = require('dotenv');

app.use(express.json())
app.use(cors());

function GetID(link) {
    const getTiktokID = /tiktok\.com(.*)\/video\/(\d+)/gm.exec(link);
    console.log(getTiktokID[2])
    return getTiktokID[2];
}

//TIKTOK DOWNLOADER - 1 VIDEO - GET LINK AND SEND BACK
app.post('/api/single/url', async (req, res) => {
    let { link } = req.body;

    console.log(`got link :  ${link}`)
    let filename = GetID(link) + ".mp4";
    console.log('file name is : ' + clc.blue(filename))

    var videoUrl;
    await axios.get(`https://api.douyin.wtf/api?url=${link}`).then(resp => {
        if (resp.data.status === "success") {
            videoUrl = resp.data.nwm_video_url;
            videoCover = resp.data.video_cover;
            console.log(clc.green('got video url with cover !' + videoCover ))
         // console.log(clc.blueBright(JSON.stringify(resp.data)))
        }
    });

    if (videoUrl) {
        console.log(videoUrl)
        res.send({url : videoUrl, cover : videoCover})

    } else {
        console.log(clc.red("[!] Failed to get video link without watermark.\n"));
    }

})



//ROUTES 
//USERS 
app.use("/api/student", students)


app.get('/', (req, res) => {
    res.send({ message: "this is working fine !" })
})



app.listen(8080, () => {
    console.log('listening on port 8080')
})




// app.get('/api/download/:id', (req, res) => {
//     const filePath = `${__dirname}/videos/${req.params.id}.mp4`;

//     res.download(filePath);


// });

//TIKTOK DOWNLOADER
// app.post('/url', async (req, res) => {
//     let { videoUrl } = req.body;

//     // get url video
//     let { nowm, wm, music } = await tiktokDL(videoUrl);
//     res.send(JSON.stringify({ nowm, wm, music }))
// })



/*
        await axios.get(videoUrl, {
            responseType: "stream"
        })
            .then(response => {
                response.data.pipe(fs.createWriteStream(`videos/${filename}`));

                //detect write stream bytes 
                var bytes = 1;
                var mb = (bytes / 1000000.0);

                response.data.on('data', function (chunk) {
                    bytes += chunk.length;
                    mb = (bytes / 1000000.0);
                    console.log('downloaded ' + clc.green(mb.toFixed(2) + ' mb'));                                   
                });
                         
                //check if write stream is done
                response.data.on('end', () => {
                    console.log(clc.green(`[+] Download successfully (${filename})\n`));
                    //check if download completed or not 
                    res.send(JSON.stringify({ download: 'success' }))
                })

            })
            .catch(error => {
                console.log(clc.red("[!] Failed to download video.\n"));
                console.log(clc.red(error));
                //response with error
                res.send(JSON.stringify({ error: error }))
            });
            */