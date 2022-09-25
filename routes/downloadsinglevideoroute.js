var express = require('express');
var router = express.Router();
const GetID = require('../utilities/GetID');

const fs = require('fs');
const axios = require('axios');
var clc = require("cli-color");
const dotenv = require('dotenv');


router.post('/url', async (req, res) => {
    let { link } = req.body;

    console.log(`got link :  ${link}`)

    let filename = GetID(link) + ".mp4";
    
    console.log('file name is : ' + clc.blue(filename))

    var videoUrl;
    await axios.get(`https://api.douyin.wtf/api?url=${link}`).then(resp => {
        if (resp.data.status === "success") {
            videoUrl = resp.data.nwm_video_url;
            videoCover = resp.data.video_cover;
            console.log(clc.green('got video url with cover !' ))
            // console.log(clc.blueBright(JSON.stringify(resp.data)))
        }
    });

    if (videoUrl) {
        //  res.send({url : videoUrl, cover : videoCover})

        await axios.get(videoUrl, {
            responseType: "stream"
        })
            .then(response => {

                // if video file already exists 
                if (fs.existsSync(`./videos/${filename}`)) {
                    console.log(clc.red('file already exists !'))
                    //get file size in mb
                    var filesize = fs.statSync(`./videos/${filename}`).size / 1000000.0;
                    res.send({ download: 'success', cover: videoCover, progress: filesize.toFixed(2) + ' mb'})
                } else {

                    //if video file does not already exist
                    response.data.pipe(fs.createWriteStream(`videos/${filename}`));

                    var downloadState = 'ongoing';

                    //detect write stream bytes 
                    var bytes = 1;
                    var mb = (bytes / 1000000.0);
                    response.data.on('data', function (chunk) {
                        bytes += chunk.length;
                        mb = (bytes / 1000000.0);
                        console.log('downloaded ' + clc.green(mb.toFixed(2) + ' mb'));
                        downloadState = 'ongoing'
                    });

                    //check if write stream is done
                    response.data.on('end', () => {
                        downloadState = 'success';
                        res.send(({ download: downloadState, cover: videoCover, progress: mb.toFixed(2) + ' mb' }))
                        console.log(clc.green(`[+] Download successfully (${filename})\n`));

                    })
                }
            })

            .catch(error => {
                console.log(clc.red("[!] Failed to download video.\n"));
                console.log(clc.red(error));
                //response with error
                res.send(JSON.stringify({ error: error }))
            });


    } else {
        console.log(clc.red("[!] Failed to get video link without watermark.\n"));
    }

})


router.get('/download/:id', (req, res) => {
    const filePath = `${__dirname}/videos/${req.params.id}.mp4`;

    res.download(filePath);
});


module.exports = router;
