const https = require('https');

const dotenv = require('dotenv');
dotenv.config();

// const Discord = require("discord.js");
const token = process.env.BOT_TOKEN;
const prefix = process.env.PREFIX;





const { Client, Intents, Channel } = require('discord.js');
const { channel } = require('diagnostics_channel');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.login(token);

// const urlApi = 'https://api.pancakeswap.info/api/v2/tokens/';
const exampleAddAlert = "Ejemplo: `" + prefix + "addalert #wbnb 0.23 sube`";
const alertWords = ["SUBE", "BAJA"];



function BotLog(discordMsg, logMsg, method, error = false)
 {
   console.log('------------------------------------------------------')
   var message
    if(!error)
      message = discordMsg + "\n"
    else
      message = "ERROR EN " + method + ":\n" + discordMsg +"\n"

    console.log(new Date() + "\n")
    console.log(message)
    if(error)
      console.log(logMsg)

    client.guilds.cache.get(_constants.GetConstant('serverId')).channels.cache.get(_constants.GetConstant('logChannelId')).send(message).catch((error) => {
      console.log(error)
    });
    
   console.log('------------------------------------------------------')
 }


client.once('ready', c => {
  BotLog("Bot iniciado", '', "onReady")
});

var DatabaseHandler = require('./DatabaseHandler')
var dbCon = DatabaseHandler.from(BotLog)

var Constants = require('./Constants')
var _constants = Constants.from(BotLog, dbCon)

var Helpers = require('./Helpers')(BotLog, _constants)




//Event when a someone joins a guild
try {
  client.on('guildMemberAdd', member => {
    NewMember(member, undefined)
  })
} catch (error) {
  BotLog(error, error, "onGuildMemberAdd", true)
}

//Event when a someone leaves a guild
try {
  client.on('guildMemberRemove', member => {
    MemberLeaves(member)
  })
} catch (error) {
  BotLog(error, error, "onGuildMemberRemove", true)
}

function NewMember(member, channel)
{
  try {
    var guild = client.guilds.cache.get(_constants.GetConstant('serverId'));
    if(channel == undefined)
      channel = guild.channels.cache.find(c => c.id == _constants.GetConstant('generalChannelId')).first()
    dbCon.ExecuteQueryAsync("select * from users where id = '" + member.id + "'", (results,err) => {

      if(results[0] != undefined && results[0].active)
        return channel.send("El usuario " + member.toString() + " ya estaba activo");

      guild.roles.create({ name: member.user.username + 'Rol'}).then(role => {
        member.roles.add(role);

        CreateCategoryChannel("Zona personal " + member.user.username,(categoryChannel,err) => {

          categoryChannel.permissionOverwrites.create(guild.roles.everyone, { VIEW_CHANNEL: false });

          categoryChannel.permissionOverwrites.create(role, {
            VIEW_CHANNEL: true,
            allow: ['MANAGE_MESSAGES']
          })
          .then(useless =>
          {
            CreateChannel("alertas-" + member.user.username, categoryChannel.id, (alertsChannel,err) => {
              // alertsChannel.roles.add(role)
            });
            CreateChannel("resumen-" + member.user.username, categoryChannel.id, (alertsChannel,err) => {
              // alertsChannel.roles.add(role)
            });


            var sql;
            if(results[0] == undefined)
              sql = "insert into users values('" + member.id + "', '" + member.user.username + "', true, '" + categoryChannel.id + "')"
            else
              sql = "update users set active = true where id = '" + member.id + "'";

            dbCon.ExecuteQuery(sql);
          })
          .catch(console.error);
        });
      });

      
      channel.send("Usuario " + member.toString() + " añadido con éxito");

    });
  } catch (error) {
    BotLog(error, error, "NewMember", true)
  }
  
}

function MemberLeaves(member, channel)
{
  try {
    var sql = "update users set active = false where id = '" + member.id + "'";

    dbCon.ExecuteQueryAsync(sql, (results,err) => {
      if(channel == undefined)
        channel = client.guilds.cache.get(_constants.GetConstant('serverId')).channels.cache.find(c => c.id == _constants.GetConstant('generalChannelId')).first()
      var msg = "";
      if(!err)
      {
        if(results[0] != undefined)
          msg = "Usuario " + member.toString() + " dado de baja con éxito";
        else
          msg = "El usuario " + member.toString() + " no estaba dado de alta";
      }
      else
        msg = "Ha habido un error al dar de baja a " + member.toString();

      channel.send(msg);
    });
  } catch (error) {
    BotLog(error, error, "MemberLeaves", true)
  }
  
}


//Event when a message is sent
try {
  client.on("messageCreate", function(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
  
    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
  
    switch(command.toUpperCase().trim() )
    {
        case "CLEAR":
          {
            var numberMsgs = 100
  
            // if(args.length == 1)
            // {
            //   var aux = args.shift().toLowerCase();
            //   if(!isNaN(aux))
            //     numberMsgs = aux + 1;
            //   else
            //   {
            //     message.reply("Error, debes especificar un número");
            //     return;
            //   }
            // }
  
            DeleteMessages(numberMsgs, message.channel)
          }
          break;
  
          case "NEWCOIN":
            {
              if(args.length == 1)
              {
                var coinAddress = args.shift().toLowerCase().trim();
  
                dbCon.ExecuteQueryAsync("select * from coins where address = '" + coinAddress + "'", (results,err) => {
                  if(results[0] != undefined)
                    message.reply("La moneda " + message.guild.cache.find(w => w.name == results[0].name).first().toString() + " ya existe");
                  else
                  {
                    GetDataFromHttps(_constants.GetConstant('urlApi') + coinAddress, (value,err) => {
                      if (err) return console.error(err);
  
                      if(value == undefined || value.hasOwnProperty("error"))
                        message.reply("Error, no se ha encontrado en PancakeSwap el contrato: `" + coinAddress + '`' )
                      else
                      {
                        var coinSymbol = value.data.symbol;

                        CreateChannel(coinSymbol, _constants.GetConstant('dbChannelId'),(channel,err) => {

                          dbCon.ExecuteQuery("insert into coins values('" +  coinAddress + "', '" + value.data.name + "', '" + coinSymbol + "', '" + channel.id + "')");
  
                          // channel.send(coinAddress).then((msg) => msg.pin())
                          channel.send(_constants.GetConstant('urlPooCoin') + coinAddress).then((msg) => msg.pin())
                          message.reply("Moneda: " + channel.toString() + " añadida con éxito");
                        });
                      }
  
                    });
                  }
                });
  
  
              }
            }
          break;
  
          case "NUEVOUSUARIO":
            {
              NewMember(message.member, message.channel)
            }
            break;
  
          case "BAJAUSUARIO":
            {
              MemberLeaves(message.member, message.channel)
            }
            break;
  
          case "NUEVAALERTA":
            {
              if(args.length != 3)
                message.reply("Número incorrecto de argumentos. " + exampleAddAlert)
              else
              {
                var channelId = Helpers.FormatChannelId(args.shift().trim());
                // console.log(message.guild.channels.cache.find(w = w.id == channelId).first())
                var channelCoin = message.guild.channels.cache.find(w => w.id == channelId);
  
                if(channelCoin == undefined)
                  message.reply("Error, debe especificar el canal de la moneda. " + exampleAddAlert)
                else
                {
                  var price = args.shift().trim();
                  if(isNaN(price))
                    message.reply("Error, debe especificar un precio. " + exampleAddAlert)
                  else
                  {
                    var alertType = args.shift().toUpperCase().trim();
                    if(!alertWords.includes(alertType))
                      message.reply("Error, el tipo de alerta debe ser uno de: '"+ alertWords.join() + "'. " + exampleAddAlert)
                    else
                    {
                      channelCoin.messages.fetchPinned()
                      .then(messages => {
                        var coinAddress = messages.first().content.replace(_constants.GetConstant('urlPooCoin'),'');
                        
                        dbCon.ExecuteQuery("insert into alerts(userId, coinAddress, priceUsd, alertType) values ('" + message.member.id + "', '" + coinAddress + "', '" + price +"', '" + alertType +"')")
                        message.reply("Alerta añadida");
  
                      });
                    }
                  }
                }
                
              }
            }
            break;

          case "LISTARALERTAS":
            {
              dbCon.ExecuteQueryAsync("select idChannel, priceUsd, alertType from alerts, coins where coinAddress = address and userId = '" + message.member.id + "'", (results,err) => {
                var msg = "";
                results.forEach(result => {
                  msg += "Moneda: <#" + result.idChannel + "> PrecioUSD: `" + result.priceUsd + "` Tipo de alerta: `" + result.alertType + "`\n";
                });

                message.reply(msg);
              });
            }
            break;

          case "BORRARALERTA":
            {
              if(args.length != 3)
                message.reply("Número incorrecto de argumentos. " + exampleAddAlert)
              else
              {
                var channelId = Helpers.FormatChannelId(args.shift().trim());
                // console.log(message.guild.channels.cache.find(w = w.id == channelId).first())
                var channelCoin = message.guild.channels.cache.find(w => w.id == channelId);
  
                if(channelCoin == undefined)
                  message.reply("Error, debe especificar el canal de la moneda. " + exampleAddAlert)
                else
                {
                  var price = args.shift().trim();
                  if(isNaN(price))
                    message.reply("Error, debe especificar un precio. " + exampleAddAlert)
                  else
                  {
                    var alertType = args.shift().toUpperCase().trim();
                    if(!alertWords.includes(alertType))
                      message.reply("Error, el tipo de alerta debe ser uno de: '"+ alertWords.join() + "'. " + exampleAddAlert)
                    else
                    {
                      channelCoin.messages.fetchPinned()
                      .then(messages => {
                        var coinAddress = messages.first().content.replace(_constants.GetConstant('urlPooCoin'),'');
                        var sqlWhere = "where userId = '" + message.member.id + "' and coinAddress = '" + coinAddress + "' and priceUsd = '" + price + "' and alertType = '" + alertType +"'";
                        
                        dbCon.ExecuteQueryAsync("select * from alerts " + sqlWhere, (results,err) => {
                          if(results.length != 0 && results[0] != undefined)
                          {
                            dbCon.ExecuteQuery("delete from alerts " + sqlWhere);
                            message.reply("Alerta eliminada");
                          }
                          else
                            message.reply("No se ha encontrado la alerta");
                        });
                      });
                    }
                  }
                }
              }
            }
            break;

          //ADMIN
          case "NEWCONSTANT":
            {
              if(message.channel.parentId != _constants.GetConstant('adminCategoryId'))
                return message.reply(_constants.GetConstantU('errorAdminText'))
              if(args.length < 2)
                message.reply("Debes incluir key y value");
              else
              {
                var key = args.shift().trim()
                var value = "";
                args.forEach(element => {
                  value += element;
                });
                _constants.SetConstant(key, value)
                message.reply("Constante añadida con éxito");
              }
            }
            break;
          
          //ADMIN
          case "LISTCONSTANTS":
            {
              if(message.channel.parentId != _constants.GetConstant('adminCategoryId'))
                return message.reply(_constants.GetConstantU('errorAdminText'))
              
              return message.reply(_constants.ListConstants())
            }
            break;
          
  
          case "T":
            {
              // dbCon.ExecuteQueryAsync("describe coins", (results,err) => {
              //   // results.forEach(result => {
              //     console.log(results[0]);
              //   // });
              // });
            }
            break;
    }
  
  })
} catch (error) {
  BotLog(error, error, "onMessageCreate", true)
}


function DeleteMessages(ammount, channel)
{
  try {
    // while(ammount > 100)
    // {
    //   DeleteMessages(100);
    //   ammount -= 100;
    // }

    channel.messages.fetch({ limit: ammount }).then(messages => {
      channel.bulkDelete(messages.size)
    });
  } catch (error) {
    BotLog(error, error, "DeleteMessages", true)
  }
  
}


async function FillDB()
{
  try {
    if(client.isReady())
    {
      let channels  = client.guilds.cache.first().channels.cache;

      for (const channel of channels)
      {
        FillPriceDB(channel[1])
      }
    }
  } catch (error) {
    BotLog(error, error, "FillDB", true) 
  }
  

}

function CreateChannel(name, parentId, callback)
{
  try {
    var guildChannels = client.guilds.cache.get(_constants.GetConstant('serverId')).channels;
    if(guildChannels.cache.find(c => c.name == name) != undefined)
    {
      callback(undefined)
      return;
    }

    guildChannels.create(name)
    .then(channel => {

      if(parentId != "")
      {
        let category = client.channels.cache.find(c => c.id == parentId);

        if (category)
          channel.setParent(category.id);
      }

      callback(channel)
    }).catch(console.error);
  } catch (error) {
    BotLog(error, error, "CreateChannel", true) 
  }
  
}

function CreateCategoryChannel(name, callback)
{
  try {
    var guildChannels = client.guilds.cache.get(_constants.GetConstant('serverId')).channels;
    if(guildChannels.cache.find(c => c.name == name) != undefined)
    {
      callback(undefined)
      return;
    }

    guildChannels.create(name, {type: 'GUILD_CATEGORY'})
    .then(channel => {
      callback(channel)
    }).catch(console.error);
  } catch (error) {
    BotLog(error, error, "CreateCategoryChannel", true)
  }
  
}



async function FillPriceDB(channelInfo)
{
  try {
    if(channelInfo.parentId == _constants.GetConstant('dbChannelId'))
    {
      await channelInfo.messages.fetchPinned()
      .then(messages => {
        var coinAddress = messages.first().content.replace(_constants.GetConstant('urlPooCoin'),'');;

        channelInfo.messages.fetch({ limit: 1 }).then(messages => {

          var previousPrice = 0;

          var sql1 = "select priceUsd from prices where coinAddress = '" + coinAddress + "' and priceDate = (select max(priceDate) from prices where coinAddress = '" + coinAddress + "')";
          // BotLog(sql1, sql1, "")
          dbCon.ExecuteQueryAsync(sql1, (resultSqlPrevprice,err) => {
            if(err || resultSqlPrevprice.hasOwnProperty("errno"))
              return BotLog(resultSqlPrevprice.sqlMessage, resultSqlPrevprice, 'FillPriceDB', true)

            if(resultSqlPrevprice[0] != undefined)
              previousPrice = resultSqlPrevprice[0][0];

            GetDataFromHttps(_constants.GetConstant('urlApi') + coinAddress, (dataFromHttps,err) => {
              if (err) return BotLog(error, error, 'FillPriceDB', true);

              var sqlDateTime = Helpers.UnixToSqlDatetime(dataFromHttps.updated_at);
              var sql2 = "select * from prices where coinAddress = '" + coinAddress + "' and priceDate = '" + sqlDateTime + "'"
              // BotLog(sql2, sql2, "")
              dbCon.ExecuteQueryAsync(sql2, (table,err) => {
                if(!err)
                {
                  if(table[0] == undefined)
                  {
                    dbCon.ExecuteQueryAsync("insert into prices values('" + coinAddress + "', '" + dataFromHttps.data.price + "', '" + sqlDateTime + "')", (results,err) => {
                      if(!err)
                      {
                        channelInfo.send(Helpers.FormatDataFromHttpsToBd(dataFromHttps, previousPrice))
                        CheckAlerts(coinAddress, dataFromHttps.data.price)
                      }
                    });
                  }
                }
              });
            });
          });
        })
      })
      .catch((error) => {BotLog(error, error, GetFuncName(), true)});
    }
  } catch (error) {
    BotLog(error, error, "FillPriceDB", true)
  }
}



function CheckAlerts(coinAddress, price)
{
  try {
    var sql = "select * from alerts where coinAddress = '" + coinAddress + "' and userId in (select id from users where active = true)";

    dbCon.ExecuteQueryAsync(sql, (tableAlerts,err) => {
      if(!err)
      {
        tableAlerts.forEach(rowAlerts => {
          var alertType = Helpers.AlertTypeHandler(rowAlerts.alertType);

          if(Helpers.IsGreaterOrLesserHandler(alertType, price, rowAlerts.priceUsd))
          {
            if(rowAlerts.lastAlert == null)
              NotifyAlert(rowAlerts, price);
            else
            {
              var alertsCooldown = _constants.GetConstant('alertsCooldown')
              if(Helpers.HourDifBetweenDates(Date.now(), rowAlerts.lastAlert) > alertsCooldown)
              {
                var newDate = Helpers.AddHoursToDate(alertsCooldown, rowAlerts.lastAlert)
                var sql2 = "select priceUsd from prices where coinAddress = '" + coinAddress + "' and priceDate >= '" + Helpers.DateToSql(newDate) + "'";
                dbCon.ExecuteQueryAsync(sql2, (tablePrices,err) => {
                  tablePrices.forEach(rowPrices => {
                    if(Helpers.IsGreaterOrLesserHandler(alertType, rowAlerts.priceUsd, rowPrices.priceUsd))
                      NotifyAlert(rowAlerts, price);
                  });
                });
              }
            }
          }
        });
      }
    });
  } catch (error) {
    BotLog(error, error, "CheckAlerts", true)
  }
}

function NotifyAlert(alertsRow, price) 
{
  try {
    var guild = client.guilds.cache.get(_constants.GetConstant('serverId'));

    var sql = "select idCategoryChannel as channelId from users where id = '" + alertsRow.userId + "'";
    sql += "\n UNION \n";
    sql += "select idChannel as channelId from coins where address = '" + alertsRow.coinAddress + "'";

    dbCon.ExecuteQueryAsync(sql, (table,err) => {
      if(!err)
      {
        var idCategoryChannel = table[0].channelId;
        var channelCoin = guild.channels.cache.get(table[1].channelId);

        var alertsChannel = guild.channels.cache.find(w => w.parentId == idCategoryChannel && w.name.includes("alertas"));

        dbCon.ExecuteQuery("update alerts set lastAlert = NOW() where id = '" + alertsRow.id + "'");
        alertsChannel.send("<@" + alertsRow.userId + "> La moneda " + channelCoin.toString() + " está en `" + price.substr(0, _constants.GetConstant('priceLength')) + "` USD")
      }
    });
  } catch (error) {
    BotLog(error, error, "CheckAlerts", true)
  }
}

function GetDataFromHttps(url, callback)
{
  try {
    https.get(url , (resp) => {
      let data = '';



      // A chunk of data has been received.
      resp.on('data', (chunk) => {
        data += chunk;
      });


      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        callback(JSON.parse(data));

      });

    }).on("error", (err) => {
      BotLog(err, err, "GetDataFromHttps", true)
      callback(undefined)
      // message.reply("Error: " + err.message);
    });
  } catch (error) {
    BotLog(error, error, "GetDataFromHttps", true)
  }
}
     




 setInterval(FillDB, 1000 * 60 * 5) //Debería ser 1000 * 60 * 5   (5 mins)