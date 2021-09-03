module.exports = {
    handle(args, msg) {
        const accepted = ["png", "jpeg", "jpg"];
        var triangle_size = 10;
        var triangle_quality = 10;

        if (args.length > 0) {
            try {
                triangle_size = parseInt(args.shift());
            } catch (e) {
                msg.channel.send("Bitch first argument should be a number");
                msg.channel.send("triangulate [triangle min size] [triangle quality]");
                return;
            }
        }
        if (args.length > 0) {
            try {
                triangle_quality = parseInt(args.shift());
            } catch (e) {
                msg.channel.send("Bitch second argument should be a number");
                msg.channel.send("triangulate [triangle min size] [triangle quality]");
                return;
            }
        }

        if (msg.attachments.first()) {
            const ext = msg.attachments.first().name.match(/(?<=\.)[A-Za-z]+/g);
            const { spawn } = require("child_process");
            if (ext && accepted.some((a) => { return a == ext[0] })) {
                const http = require('https'); // or 'https' for https:// URLs
                const fs = require('fs');
                console.log(msg.attachments.first());
                const dest = msg.attachments.first().name;
                const file = fs.createWriteStream(dest);
                console.log("URL: ", msg.attachments.first().attachment)
                const request = http.get(msg.attachments.first().attachment, function(response) {
                    response.pipe(file);
                    response.on("close", () => {
                        file.close(() => {
                            console.log([dest, triangle_size, 1 / triangle_quality]);
                            const spawned = spawn("triangulate", [dest, triangle_size, 1 / triangle_quality]);
                            spawned.on("exit", () => {
                                msg.channel.send("triangulated bitch", { files: ["./out.png"] });
                                fs.unlink(dest, () => {});
                            });
                        });
                    });
                }).on('error', function(err) { // Handle errors
                    fs.unlink(dest, () => {}); // Delete the file async. (But we don't check the result)
                    console.log(err);
                    msg.channel.send("IDK something went wrong");
                });
            } else {
                msg.channel.send("Scary File, send image");
            }
        } else {
            msg.channel.send("No file attached idot");
        }
    }
}