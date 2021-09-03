const Discord = require("discord.js");
const fs = require("fs");
const ocr = require("./ocr");
const math = require("./math.js");
const triangulate = require("./triangulate.js");

const CLIENT_SECRET = "NzUzNDQ4ODQ2MjQzMjY2NTgz.X1mV6w.e9qKu-u4Fe164f8t-f6gBbNZQ2U";

var suggestions = {};

const DATA_PATH = "./suggestions.json";

const client = new Discord.Client();

const PREFIXES = [".artemis", ".a", ".luna"];

const args_regex = /(`[^`]*`)|('[^']*')|("[^"]*")|\S+/g;


var POLL_ID = 0;


client.on("ready", () => {

});
/**
 * @typedef {{question: String, answers: [{name:String,emoji:String}],time: Number, results: [Number], messageid: Any, id:Number}} Poll
 * 
 * @type {[Poll]}
 */
var ongoingPolls = [];


const EMOJIS = {
    a: "🇦",
    b: "🇧",
    c: "🇨",
    d: "🇩",
    e: "🇪",
    f: "🇫",
    g: "🇬",
    green_square: "🟩",
    black_square: "⬛",
};

function formattedTime(mill) {
    const sec = Math.floor(mill / 1000);
    var out = "";
    if (sec % 60 !== 0) {
        out = `${sec % 60} ${sec%60 === 1 ? "second" : "seconds"}`;
    }
    if (sec >= 60) {
        const min = Math.floor(sec / 60);
        if (min % 60 !== 0) {
            out += `${min % 60} ${min%60 === 1 ? "minute" : "minutes"} ` + out;
        }
        if (min >= 60) {
            const hr = Math.floor(min / 60);
            if (hr % 24 !== 0) {
                out += `${hr % 24} ${hr%24 === 1 ? "hour" : "hours"} ` + out;
            }
            if (hr >= 24) {
                const days = Math.floor(hr / 24);
                out += `${days} ${days === 1 ? "day" : "days"}` + out;
            }
        }
    }
    return out;
}

/**
 * 
 * @param {[String]} args
 * @returns {Poll}
 */
function createPoll(args) {

    var question = "";
    var time = 15000;

    const answers = [];

    const isCommand = (str) => {
            if (str === "-time") {
                return 1;
            }
            return -1;
        }
        /**
         * 
         * @param {String} str 
         */
    const parseTime = (str) => {
        var i = 0;
        var out = 0;
        var temp = "";
        const isDigit = (a) => {
            return "0" <= a && a <= "9";
        }
        while (i < str.length) {
            const curr = str[i++];
            if (isDigit(curr)) {
                temp += curr;
            } else if (curr === "s") {
                const val = parseInt(temp);
                out += val * 1000;
                temp = "";
            } else if (curr === "m") {
                const val = parseInt(temp);
                out += val * 1000 * 60;
                temp = "";
            } else if (curr === "h") {
                const val = parseInt(temp);
                out += val * 1000 * 60 * 60;
                temp = "";
            } else if (curr === "d") {
                const val = parseInt(temp);
                out += val * 1000 * 60 * 60 * 24;
                temp = "";
            } else {
                temp = "";
            }
        }
        return out;
    }

    var state = 0;

    var i = 0;
    while (i < args.length) {
        const curr = args[i++];
        const comm = isCommand(curr);

        if (comm === -1) {
            if (state === 0) {
                question = curr;
                state = 1;
            } else {
                answers.push(curr);
            }
        } else if (comm === 1) {
            time = parseTime(args[i++]);
        }
    }
    return {
        question: question,
        answers: answers.map(
            (name, i) => {
                return {
                    name: name,
                    emoji: getEmojiFromNumber(i)
                };
            }
        ),
        time: time,
        results: answers.map(
            () => {
                return 0;
            }
        ),
        messageid: null,
        id: POLL_ID++,
    }
}

function getEmojiFromNumber(n) {
    if (n == 0) {
        return EMOJIS.a;
    } else if (n == 1) {
        return EMOJIS.b;
    } else if (n == 2) {
        return EMOJIS.c;
    } else if (n == 3) {
        return EMOJIS.d;
    } else if (n == 4) {
        return EMOJIS.e;
    } else if (n == 5) {
        return EMOJIS.f;
    }
}

function getNumberFromEmoji(n) {
    if (n === EMOJIS.a) {
        return 0;
    } else if (n === EMOJIS.b) {
        return 1;
    } else if (n === EMOJIS.c) {
        return 2;
    } else if (n === EMOJIS.d) {
        return 3;
    } else if (n === EMOJIS.e) {
        return 4;
    } else if (n === EMOJIS.f) {
        return 5;
    }
}
/**
 * 
 * @param {Discord.TextChannel} channel 
 * @param {Poll} poll 
 */
function sendPoll(channel, poll) {
    const pollEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Poll Time!')
        .setDescription(poll.question)
        .setTimestamp()
        .setFooter('Vote by reactions');

    poll.answers.forEach(
        (answer) => {
            pollEmbed.addField(answer.name, `Vote ${answer.emoji}`);
        }
    );

    pollEmbed.addField(`Poll is open for ${formattedTime(poll.time)}`, `vote now!`);

    return channel.send(pollEmbed);
}
/**
 * 
 * @param {Poll} poll 
 */
function sendPollResults(poll) {
    var total = 0;
    poll.results.forEach(
        (c) => {
            total += c;
        }
    );

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle("Poll Ended!")
        .setDescription(poll.question)
        .setTimestamp();

    if (total === 0) {
        embed.addField("lmao nobody voted", `Poll held for ${formattedTime(poll.time)}`);
        return embed;
    }

    poll.results.forEach(
        (c, i) => {
            var a = "";
            for (var j = 0; j < 10; j++) {
                if (j / 10 < c / total) {
                    a += EMOJIS.green_square;
                } else {
                    a += EMOJIS.black_square;
                }
            }

            a += ` - ${Math.round((c/total) * 100)}% (${c} ${c == 1 ? "vote" : "votes"})`;

            embed.addField(poll.answers[i].name, a);
        }
    );

    embed.addField(`Total of ${total} ${(total === 1 ? "vote" : "votes")}`, `Poll held for ${formattedTime(poll.time)}`);

    return embed;
}

client.on("message", (message) => {
    const msg = message.content;
    const yes = msg.match(args_regex);
    const args = (yes ? yes : []).map(
        (thing) => {
            if (thing[0] === "\"" && thing[thing.length - 1] === "\"") {
                return thing.substring(1, thing.length - 1);
            } else if (thing[0] === "'" && thing[thing.length - 1] === "'") {
                return thing.substring(1, thing.length - 1);
            } else if (thing[0] === "`" && thing[thing.length - 1] === "`") {
                return thing.substring(1, thing.length - 1);
            }
            return thing;
        }
    );
    const fuck = args.shift();
    if (PREFIXES.some((val) => fuck === val)) {
        const command = args.shift();
        if (command === "poll") {
            const poll = createPoll(args);
            message.delete();
            sendPoll(message.channel, poll).then(
                (message) => {
                    const reactions = poll.answers.map(
                        (answer) => {
                            return message.react(answer.emoji);
                        }
                    );

                    Promise.all(reactions).then(
                        () => {
                            poll.messageid = message.id;

                            ongoingPolls.push(poll);
                            setTimeout(
                                () => {
                                    const i = ongoingPolls.findIndex(
                                        (test) => {
                                            return test.id === poll.id;
                                        }
                                    );
                                    ongoingPolls.splice(i, 1);
                                    message.delete();
                                    message.channel.send(sendPollResults(poll));
                                },
                                poll.time
                            );
                        }
                    );
                }
            );

        } else if (command === "read") {
            ocr.recognize(message, args);
        } else if (command === "math") {
            math.handle(args, message);
        } else if (command === "triangulate") {
            triangulate.handle(args, message);
        }
    }
});

client.on("messageReactionRemove", (messageReaction) => {
    ongoingPolls.some(œ
        (poll) => {
            if (poll.messageid === messageReaction.message.id) {
                const i = getNumberFromEmoji(messageReaction._emoji.name);
                poll.results[i]--;
                return true;
            }
            return false;
        }
    );
});

client.on("messageReactionAdd", (messageReaction) => {

    ongoingPolls.some(
        (poll) => {
            if (poll.messageid === messageReaction.message.id) {
                const i = getNumberFromEmoji(messageReaction._emoji.name);
                poll.results[i]++;
                return true;
            }
            return false;
        }
    );
});

client.login(CLIENT_SECRET);