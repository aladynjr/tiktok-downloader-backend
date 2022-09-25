const express = require('express');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
var clc = require("cli-color");
const dotenv = require('dotenv');
const GetID = require('./utilities/GetID');
var zipper = require("zip-local");

const uuid = require('uuid');

const students = require('./routes/studentsroutes');
const downloadSingleVideo = require('./routes/downloadsinglevideoroute');

const { v4: uuidv4 } = require('uuid');


const app = express();


app.use(express.json())
app.use(cors());



//TIKTOK DOWNLOADER - 1 VIDEO - GET LINK AND SEND BACK
app.use('/api/single', downloadSingleVideo)

//TIKTOK DOWNLOADER - BULK VIDEOS
app.post('/api/bulk/urls', async (req, res) => {
    let { links } = req.body;
    console.log(clc.blue('recieved links '))
    if (!links) return;

var completed = [];

    //create folder with folderName
    var folderName = GetID(links[0]) //uuidv4();
    fs.mkdirSync(`./tiktoks/${folderName}`, { recursive: true }, (err) => {
        if (err) throw err;
    });
    fs.mkdirSync(`./tiktoks/${folderName}photos`, { recursive: true }, (err) => {
        if (err) throw err;
    });

    var detailsList = [];
    //loop through links with a while do loop   
    var i = 0;
    while (i < links.length) {

        let link = links[i];
        let filename = i + GetID(link) + ".mp4";
        var videoUrl;

        await axios.get(`https://api.douyin.wtf/api?url=${link}`).then(resp => {
            if (resp.data.status === "success") {
                videoUrl = resp.data.nwm_video_url;
                videoCover = resp.data.video_cover;

                filename = i + resp.data.video_title.substring(0, 30) + GetID(link) + ".mp4"

                detailsList.push({ title: resp.data.video_title, author: resp.data.video_author })

                console.log(clc.green('got video ' + (i + 1) + ' url with cover !'))
                // console.log(clc.blueBright(JSON.stringify(resp.data)))
            }

        }).then(async () => {
            if (videoUrl) {

                 axios.get(videoUrl, {
                    responseType: "stream"
                })
                    .then(response => {

                        response.data.pipe(fs.createWriteStream(`tiktoks/${folderName}/${filename}`));


                        //check if write stream is done
                        response.data.on('end', () => {
                            console.log(clc.green(`[+] Video Downloaded successfully (${filename})\n`));

                            if ((filename.substring(0, 1) == (links.length - 1)) || (filename.substring(0, 2) == (links.length - 1))) {
                                console.log(clc.green('done downloading all videos !'))

                                //compress folder
                                zipper.sync.zip(`./tiktoks/${folderName}`).compress().save(`./tiktoks/${folderName}.zip`);
                                console.log(clc.green('VIDEOS FOLDER ZIPPED !'))

                                //delete folder after zipping
                                fs.rmSync(`./tiktoks/${folderName}`, { recursive: true, force: true }, (err) => {
                                    if (err) throw err;
                                });
                                console.log(clc.green('VIDEOS FOLDER DELETED !'))
                                completed.push('videos')
                            //    res.send(({ download: 'success', detailsList: detailsList }))
                            if(completed.includes('videos') && completed.includes('photos')){
                                res.send(({ download: 'success', detailsList: detailsList }))
                            }
                            }
                        })

                    })

                    .catch(error => {
                        console.log(clc.red("[!] Failed to download video.\n"));
                        console.log(clc.red(error));
                        //response with error
                        //  res.send(JSON.stringify({ error: error }))
                    });

                //download cover photo and save it to the same folder 
                axios.get(videoCover, {
                    responseType: "stream"
                })
                    .then(response => {
                        response.data.pipe(fs.createWriteStream(`tiktoks/${folderName}photos/${filename.substring(0, filename.length - 4) + ".png"}`));
                        response.data.on('end', () => {
                            console.log(clc.green('[+] Photo Downloaded successfully   !'));

                            ///check if we reached the end of the looop 
                            if ((filename.substring(0, 1) == (links.length - 1)) || (filename.substring(0, 2) == (links.length - 1))) {
                                console.log(clc.green('done downloading all photos !'))

                                //compress folder
                                zipper.sync.zip(`./tiktoks/${folderName}photos`).compress().save(`./tiktoks/${folderName}photos.zip`);
                                console.log(clc.green('PHOTOS FOLDER ZIPPED !'))

                                //delete folder after zipping
                                fs.rmSync(`./tiktoks/${folderName}photos`, { recursive: true, force: true }, (err) => {
                                    if (err) throw err;
                                });
                                console.log(clc.green('PHOTOS FOLDER DELETED !'))
                                completed.push('photos')

                                //res.send(({ download: 'success', detailsList: detailsList }))
                                if(completed.includes('videos') && completed.includes('photos')){
                                    res.send(({ download: 'success', detailsList: detailsList }))
                                }
                            }

                        })
                    })
                    .catch(err => {
                        console.log(clc.red('error downloading cover photo ' + (i + 1) + ' !'))
                    })
                    

            } else {
                console.log(clc.red("[!] Failed to get video link without watermark.\n"));


            }
            i++;
        });

    }
})

app.get('/api/bulk/download/:id', (req, res) => {
    const filePath = `${__dirname}/tiktoks/${req.params.id}.zip`;

    res.download(filePath);
});


//ROUTES 
app.use("/api/student", students)





app.get('/', (req, res) => {
    res.send({ message: "this is working fine !" })
})

app.listen(8080, () => {
    console.log('listening on port 8080')


})




app.get('/api/download/:id', (req, res) => {
    const filePath = `${__dirname}/tiktoks/${req.params.id}.mp4`;

    res.download(filePath);


});

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
                response.data.pipe(fs.createWriteStream(`tiktoks/${filename}`));

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