function GetID(link) {
    const getTiktokID = /tiktok\.com(.*)\/video\/(\d+)/gm.exec(link);
    //console.log(getTiktokID[2])
    return getTiktokID[2];
}

module.exports = GetID;