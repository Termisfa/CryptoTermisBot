const https = require('https');

const dotenv = require('dotenv');
dotenv.config();

// const Discord = require("discord.js");
const token = process.env.BOT_TOKEN;


const { Client, Intents, Channel } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.login(token);

const urlApi = 'https://api.pancakeswap.info/api/v2/tokens/';
const prefix = "!";

const PRICE_LENGTH = 7;

client.on("messageCreate", function(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;



  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();

  if(command.toUpperCase().trim() == "GET")
  {
    message.channel.messages.fetchPinned()
    .then(messages => { 
      // console.log(messages.first().content)
      https.get(urlApi + messages.first().content , (resp) => {
        let data = '';
      
      
      
        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          data += chunk;
        });
      
      
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          let answer = "";

          parsedData = JSON.parse(data)

          answer += "Actualizado: `" + timeConverter(parsedData.updated_at) + "`\n";
          answer += "Nombre: `" + parsedData.data.name + "`\n"
          answer += "Símbolo: `" + parsedData.data.symbol + "`\n"
          answer += "Precio USD: `" + parsedData.data.price.substr(0, 7) + "`\n"
          // answer += "Precio BNB: " + parsedData.data.price_BNB;

        message.reply(answer)
        // console.log(answer)
      
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        // message.reply("Error: " + err.message);
      });
      // console.log(`Received ${messages.size} messages`)
    })
    .catch(console.error);
  }
  else if(command.toUpperCase().trim() == "CLEAR")
  {
    
    message.channel.messages.fetch({ limit: 100 }).then(messages => {
      console.log(`Received ${messages.size} messages`);

      message.channel.bulkDelete(messages.size - 1)


      //Iterate through the messages here with the variable "messages".
      // for(const message of messages)
      // {
      //   if(message.author.bot)
      //     message.delete();
      // }
      // messages.forEach(message => console.log(message.content))
    })
    // console.log(message.channel.message.get.messageCount)
    //  message.channel.bulkDelete(message.channel.messages.messageCount - 1)
  }





  // if (command === "ping") {
  //   const timeTaken = Date.now() - message.createdTimestamp;
  //   message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
  // }
  // else
  // {
    
  // }
  
});


async function FillDB()
{
  // let server = (await client.guilds.fetch()).first();
  if(client.isReady())
  {
    let channels  = client.guilds.cache.first().channels.cache;

    for (const channel of channels) 
    {
      FillChannelDB(channel[1])
    }
  }
  
  // console.log( client.guilds.cache.first().channels.cache)
  // console.log( client.guilds.cache.first().channels.cache.get('923649189324394506'))
}



async function FillChannelDB(channelInfo)
{
  if(channelInfo.parentId == 923649189324394506)
  {
    // var channelId = channelInfo.id;

    var pinnedMessage;
    
    await channelInfo.messages.fetchPinned()
    .then(messages => { 
      pinnedMessage = messages.first().content;
    })
    .catch(console.error);

    channelInfo.messages.fetch({ limit: 1 }).then(messages => {

      var previousPrice = 0;
      var previousMessage = messages.first().content

      if(previousMessage.includes("USD"))
        previousPrice = previousMessage.substr((PRICE_LENGTH + 1) * -1).substr(0, PRICE_LENGTH);

      GetDataFromHttps(urlApi + pinnedMessage, (value,err) => {
        if (err) return console.error(err);
  
        
  
        channelInfo.send(FormatDataFromHttpsToBd(value, previousPrice))
  
      });


    })

    

    

  }
}



function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp );
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = "0" + a.getHours();
  var min = "0" + a.getMinutes();
  var sec = "0" + a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour.substr(-2) + ':' + min.substr(-2) + ':' + sec.substr(-2) ;
  return time;
}

function GetDataFromHttps(url, callback)
{
     https.get(url , (resp) => {
        let data = '';
      
      
      
        // A chunk of data has been received.
        resp.on('data', (chunk) => {
          data += chunk;
        });
      
      
        // The whole response has been received. Print out the result.
        resp.on('end', () => {          
          callback(data);
      
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        // message.reply("Error: " + err.message);
      });
}

function FormatDataFromHttpsToBd(data, previousPrice)
{
  let answer = new Array(60).join( '-' ) + "\n";

  parsedData = JSON.parse(data)

  var emote = "";

  var actualPrice = parsedData.data.price.substr(0, PRICE_LENGTH)

  if(previousPrice != 0)
  {
    if(previousPrice < actualPrice)
      emote = " :point_up_2: "
    else
      emote = " :point_down: ";
  }
  

  answer += "Actualizado: `" + timeConverter(parsedData.updated_at) + "`\n";
  // answer += "Nombre: `" + parsedData.data.name + "`\n"
  // answer += "Símbolo: `" + parsedData.data.symbol + "`\n"
  answer += emote + "Precio USD: ";
  answer += "`" + actualPrice + "`\n";

  


  // answer += "Precio BNB: " + parsedData.data.price_BNB;
  
  // console.log(answer)

  return answer;
}



 setInterval(FillDB, 1000 * 60 * 6) //Debería ser 1000 * 60 * 6   (6 mins)