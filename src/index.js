const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const fs = require("fs");
const client = new Discord.Client();
client.commands = new Discord.Collection;

// command handler
fs.readdir("./commands/", (err, files) => {
    //error handling
    if(err)
        console.log(err);

    let jsfile = files.filter(f => f.split(".").pop() === "js");
    if(jsfile.length <= 0){
        console.log("Couldn't find commands");
        return;
    }

    jsfile.forEach((f, i) =>{
        let props = require(`./commands/${f}`);
        console.log(`${f} loaded`);
        client.commands.set(props.help.name, props);
    });
});

// on load
client.once('ready', () => {
    console.log('on');
    console.log('-----------------------');
});

// when a message is sent that the bot can see
client.on('message', message => {
    if(message.author.bot) 
        return;
    if(message.channel.type === "dm"){
        message.channel.send('dont pm me');
        return;
    }

    if(message.content.startsWith(prefix)){
        let messageArray = message.content.split(" ");
        let cmd = messageArray[0];
        let args = messageArray.slice(1);
    
        // client.commands is array of loaded files
        let commandfile = client.commands.get(cmd.slice(prefix.length));
        if(commandfile){
            // run the file that corresponds to the command
            commandfile.run(client, message, args);
            console.log(`${cmd} run`);
        } else
            message.channel.send("Command doesn't exist");
    }
});


client.login(token);