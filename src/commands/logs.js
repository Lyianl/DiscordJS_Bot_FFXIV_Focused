const Discord = require('discord.js');
const { fflogs_token } = require('../config.json');
const request = require('request');
const rp = require('request-promise');

const grey = 6710886;
const green = 2031360;
const blue = 28927;
const purple = 10696174;
const orange = 16744448;
const gold = 15060096;
const EU = ["cerberus", "lich", "louisoix", "moogle", "odin", "omega", "phoenix", "ragnarok", "shiva", "zodiark"];
const JP = ["aegis","atomos","carbuncle","garuda","gungnir","kujata","ramuh","tonberry","typhon","unicorn","alexander","bahamut","durandal","fenrir","ifrit","ridill","tiamat","ultima","valefor","yojimbo","zeromus","anima","asura","belias","chocobo","hades","ixion","mandragora","masamune","pandaemonium","shinryu","titan"];
const NA = ["adamantoise","balmung","cactuar","coeurl","faerie","gilgamesh","goblin","jenova","mateus","midgardsormr","sargatanas","siren","zalera","behemoth","brynhildr","diabolos","excalibur","exodus","famfrit","hyperion","lamia","leviathan","malboro","ultros"];

function between(x, min, max) {
    return x >= min && x <= max;
}

function arrayContains(needle, arrhaystack)
{
    return (arrhaystack.indexOf(needle) > -1);
}

function getColor(avg){
    if(between(avg, 0, 24)){
        color = grey;
    }
    if(between(avg, 25, 49)){
        color = green;
    }
    if(between(avg, 50, 74)){
        color = blue;
    }
    if(between(avg, 75, 94)){
        color = purple;
    }
    if(between(avg, 95, 99)){
        color = orange;
    }
    if(between(avg, 99.5, 100)){
        color = gold;
    }
    return color;
}

module.exports.run = async (client, message, args) => {
    var average = 0;
    var region = "";

    if(args != ""){

        if(args[2]){
            if(arrayContains(args[2].toLowerCase(), EU))
                region = "EU";

            if(arrayContains(args[2].toLowerCase(), NA))
                region = "NA";

            if(arrayContains(args[2].toLowerCase(), JP))
                region = "JP";
        }

        if (region != ""){
            rp(`https://www.fflogs.com:443/v1/rankings/character/${args[0]}%20${args[1]}/${args[2]}/${region}?api_key=${fflogs_token}`)
            .then(function(data){
                data = JSON.parse(data);
                // console.log(data);
        
                if(data.hidden)
                    message.channel.send('Logs hidden');
                else{
                    var encounters = [];
                    var inserted = [];
                    var bool = false;
    
                    if(args[3] == "all"){
                        data.forEach(function(e, i) {
                            average += parseInt(e.percentile, 10);
                            encounters.push({
                                "name": `${e.encounterName} (${e.spec})`,
                                "value": `[DPS: ${e.total} (${e.percentile})](https://www.fflogs.com/reports/${e.reportID}#fight=${e.fightID}&type=damage-done)`
                            });
                        });
                    } else {
                        data.forEach(function(e, i) {
                            //first
                            if(!bool){
                                average += parseInt(e.percentile, 10);
                                // console.log('first'+e.spec);
                                encounters.push({
                                    "name": `${e.encounterName} (${e.spec})`,
                                    "value": `[DPS: ${e.total} (${e.percentile})](https://www.fflogs.com/reports/${e.reportID}#fight=${e.fightID}&type=damage-done)`
                                });
                                inserted = {
                                    "encName": e.encounterName,
                                    "percentile": e.percentile
                                };
                                bool = true;
                            }
    
                            if(inserted.encName == e.encounterName){
                                // same encounter better percentile 
                                if(inserted.percentile < e.percentile){
                                    // console.log('better'+e.spec);
                                    average -= parseInt(inserted.percentile, 10);
                                    average += parseInt(e.percentile, 10);
                                    encounters[encounters.length-1] = {
                                        "name": `${e.encounterName} (${e.spec})`,
                                        "value": `[DPS: ${e.total} (${e.percentile})](https://www.fflogs.com/reports/${e.reportID}#fight=${e.fightID}&type=damage-done)`
                                    };
                                    inserted = {
                                        "encName": e.encounterName,
                                        "percentile": e.percentile
                                    };
                                }
                            } else {
                                // new encounter
                                // console.log('new'+e.spec);
                                average += parseInt(e.percentile, 10);
                                encounters.push({
                                    "name": `${e.encounterName} (${e.spec})`,
                                    "value": `[DPS: ${e.total} (${e.percentile})](https://www.fflogs.com/reports/${e.reportID}#fight=${e.fightID}&type=damage-done)`
                                });
                                inserted = {
                                    "encName": e.encounterName,
                                    "percentile": e.percentile
                                };
                            }
                        });
                    }
    
    
                    message.channel.send({
                        embed: {
                            color: getColor(average/encounters.length),
                            author: {
                                name: data[0].characterName
                                // ,
                                // icon_url: message.author.avatarURL
                            },
                            fields: encounters
                        }
                    });
                }
                })
                .catch(function(err){
                    console.log(err.message);
                    message.channel.send(`Error ${err.message}`);
                });
        } else {
            message.channel.send('World not found \nSyntax: [optional]\n\`p!logs {character name} {server name} [all]\`');
        }
    } else {
        message.channel.send('No character provided \nSyntax: [optional]\n\`p!logs {character name} {server name} [all]\`');
    }

}

module.exports.help = {
    name: "logs"
}