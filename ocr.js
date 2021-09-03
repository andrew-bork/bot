const tesseract = require("./tesseract");
const fs = require("fs");
const download = require("download");

const a = /(?<=\.)[A-Za-z0-9]+/g

/**
 * 
 * @param {any} msg 
 * @param {[string]} args 
 */
function recognize(msg, args) {

    const options = {};

    while (args.length > 0) {
        const comm = args.shift();
        if (comm === "-l") {
            const lang = args.shift();
            options.lang = lang;
        }
    }

    const file = msg.attachments.array()[0];
    const ext = file.name.match(a)[0];
    if (ext === "jpg") {
        download(file.url).pipe(fs.createWriteStream("./file.jpg")).on("finish", () => {
            tesseract.recognize("file.jpg", options)
                .then(text => {
                    msg.channel.send(text);
                })
                .catch(error => {
                    console.log("err ", error);
                });
        });
    } else if (ext === "png") {
        download(file.url).pipe(fs.createWriteStream("./file.png")).on("finish", () => {
            tesseract.recognize("file.png", options)
                .then(text => {
                    msg.channel.send(text);
                })
                .catch(error => {
                    console.log("err ", error);
                });
        });
    }
}

module.exports = {
    recognize: recognize,
};