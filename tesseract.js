const { exec } = require("child_process");
const fs = require("fs");

/**
 * @typedef {{lang: string}} TesseractOptions
 * 
 * @param {string} filename 
 * @param {TesseractOptions} options 
 */
function recognize(filename, options) {
    const lang = (options && options.lang ? options.lang : "eng");

    return new Promise(
        (res, rej) => {
            console.log(`tesseract ${filename} output --tessdata-dir ./lang -l ${lang} `);
            const fuck = exec(`tesseract ${filename} output --tessdata-dir ./lang -l ${lang} `, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
            });
            fuck.on("close", () => {
                const out = fs.readFileSync("output.txt", { encoding: "utf-8" });
                console.log(out);
                res(out);
            });
        });
}

recognize("test.png", { lang: "chi_tra" });

module.exports = {
    recognize: recognize
}