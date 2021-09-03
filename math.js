const expression = require("./expression");

module.exports = {
    /**
     * 
     * @param {[String]} args 
     * @param {*} message 
     */
    handle(args, message) {

        // Deal with command arguments for math command.
        const opt = args.shift();
        if (opt === "eval") {
            const exp = args.shift();
            try {
                message.channel.send(`${expression.string(expression.evaluate(exp))}`);
            } catch (error) {
                message.channel.send(`BAD EXPRESSION`);
            }
        }

    }
}