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

client.on("message", function(message) {
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
      var channelInfo = channel[1];
      if(channelInfo.parentId == 923649189324394506)
      {
        // let channel1 = client.channels.cache.get(channel[1].id);

        var pinnedMessage;
        
        await channelInfo.messages.fetchPinned()
        .then(messages => { 
          pinnedMessage = messages.first().content;
        })
        .catch(console.error);


        // var result = await GetDataFromHttps(urlApi + pinnedMessage)

        GetDataFromHttps(urlApi + pinnedMessage, (err, value) => {
          if (err) return console.error(err);

          client.channels.cache.find(c => c.id == 923633424013598761).send(value)

          // channelInfo.send(value)
      
          console.log(value);
      });



      }
    }
  }
  
  // console.log( client.guilds.cache.first().channels.cache)
  // console.log( client.guilds.cache.first().channels.cache.get('923649189324394506'))
}







function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp );
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
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
          let answer = "";

          parsedData = JSON.parse(data)

          answer += "Actualizado: `" + timeConverter(parsedData.updated_at) + "`\n";
          answer += "Nombre: `" + parsedData.data.name + "`\n"
          answer += "Símbolo: `" + parsedData.data.symbol + "`\n"
          answer += "Precio USD: `" + parsedData.data.price.substr(0, 7) + "`\n"
          // answer += "Precio BNB: " + parsedData.data.price_BNB;
          
          // console.log(answer)
          callback(answer);
      
        });
      
      }).on("error", (err) => {
        console.log("Error: " + err.message);
        // message.reply("Error: " + err.message);
      });
}



 setInterval(FillDB, 1000) //Debería ser 1000 * 60 * 5.5 (5 mins y medio)