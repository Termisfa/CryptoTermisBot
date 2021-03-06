

module.exports = function(BotLog, _constants){
    class Helpers{
        
      
      static FormatDataFromHttpsToDatabaseChannel(parsedData, previousPrice)
        {
          try {
            let answer = new Array(60).join('-') + "\n";
        
            var emote = "";
        
            var actualPrice = parsedData.data.price

            if(previousPrice != 0)
            {
              if(Number(previousPrice) < Number(actualPrice))
                emote = " :point_up_2: "
              else if(Number(previousPrice) > Number(actualPrice))
                emote = " :point_down: ";
            }

            actualPrice = actualPrice.substr(0, _constants.GetConstant('priceLength'))
        
            answer += "Actualizado: `" + timeConverter(parsedData.updated_at) + "`\n";
            // answer += "Nombre: `" + parsedData.data.name + "`\n"
            // answer += "Símbolo: `" + parsedData.data.symbol + "`\n"
            answer += emote + "Precio USD: ";
            answer += "`" + actualPrice + "`\n";
            // answer += "Precio BNB: " + parsedData.data.price_BNB;
            return answer;
          } catch (error) {
            BotLog(error, error, "FormatDataFromHttpsToBd", true)
          }
        }

        static FormatDataFromHttpsToResumeChannel(parsedData, coinChannel, coinAddress)
        {
          try {
            let answer = new Array(60).join('-') + "\n";

            answer += "Nombre: `" + parsedData.data.name.trim() + "`\n"
            answer += "Símbolo: `" + parsedData.data.symbol.trim() + "`\n"
            answer += "Canal: " + coinChannel.toString() + "\n"
            answer += "Actualizado: `" + timeConverter(parsedData.updated_at) + "`\n";
            answer += "Precio USD: `" + parsedData.data.price.substr(0, _constants.GetConstant('priceLength')) + "`\n";
            answer += _constants.GetConstant('urlPooCoin') + coinAddress;

            return answer;

          } catch (error) {
            BotLog(error, error, "FormatDataFromHttpsToResumeChannel", true)
          }
        }
    
        static FormatChannelId(rawId)
        {
          return rawId.replace('<','').replace('>','').replace('#','');
        }

        static IsGreaterOrLesserHandler(option, ammount1, ammount2)
        {
            switch (option) {
                case '>': return IsGreaterThan(ammount1, ammount2); break;
                case '>=': return IsGreaterOrEqualThan(ammount1, ammount2); break;
                case '=': return IsEqual(ammount1, ammount2); break;
                case '!=': return IsNotEqual(ammount1, ammount2); break;
                case '<': return IsLesserThan(ammount1, ammount2); break;
                case '<=': return IsLesserOrEqualThan(ammount1, ammount2); break;
            
                default:
                    break;
            }
        }
    
        static UnixToSqlDatetime(UNIX_timestamp, sqlFormat = true)
        {
          try {
            var date = new Date(UNIX_timestamp);
            return dateToSql(date, sqlFormat);

            
          } catch (error) {
            BotLog(error, error, "UnixToSqlDatetime", true)
          }
        }

        static DateToSql(date, sqlFormat = true)
        {
            return dateToSql(date, sqlFormat);
        }

        static HourDifBetweenDates(date1, date2)
        {
            try {
                return Math.round(Math.abs(date1 - date2) / 36e5); //36e5 is the scientific notation for 60*60*1000
            } catch (error) {
                BotLog(error, error, "HourDifBetweenDates", true)
            }
        }

        static AddHoursToDate(ammountHours, date)
        {
            try {
                return (new Date(date)).addHours(ammountHours)
            } catch (error) {
                BotLog(error, error, "AddHoursToDate", true)
            }
        }
        
        static TimeConverter(UNIX_timestamp)
        {
            return timeConverter(UNIX_timestamp)
        }

        static GetCoinChannelFromAddress(coinAddress, dbCon, client, callback)
        {
          try {
            var sql = "select * from coins where address like '" + coinAddress + "'";
            dbCon.ExecuteQueryAsync(sql, (table,err) => {
              if(!err)
                callback(client.guilds.cache.get(_constants.GetConstant('serverId')).channels.cache.get(table[0].idChannel));
            });
          } catch (error) {
            BotLog(error, error, "GetCoinChannelFromAddress", true)
          }
        }

        static GetCategoryChannelIdFromUserId(userId, dbCon, callback)
        {
          try {
            var sql = "select idCategoryChannel from users where id = '" + userId + "'";
            dbCon.ExecuteQueryAsync(sql, (table,err) => {
              if(!err)
                  callback(table[0].idCategoryChannel);
            });
          } catch (error) {
            BotLog(error, error, "GetCategoryChannelIdFromUserId", true)
          }
        }

        static GetGuild(client)
        {
          try {
            return client.guilds.cache.get(_constants.GetConstant('serverId'));
          } catch (error) {
            BotLog(error, error, "GetCategoryChannelIdFromUserId", true)
          }
        }


    }
    
    
    
    return Helpers;
}

function GetGuild(client)
{
  try {
    return client.guilds.cache.get(constants.GetConstant('serverId'));
  } catch (error) {
    BotLog(error, error, "getGuild", true)
  }
}


function timeConverter(UNIX_timestamp)
{
    try {
        var a = new Date(UNIX_timestamp );
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var day = a.getDate();
        var hour = "0" + a.getHours();
        var min = "0" + a.getMinutes();
        var sec = "0" + a.getSeconds();
        var time = day + ' ' + month + ' ' + year + ' ' + hour.substr(-2) + ':' + min.substr(-2) + ':' + sec.substr(-2) ;
        return time;
      } catch (error) {
        console.log(error)
        throw error
      }
}


function IsGreaterThan(ammount1, ammount2)
{
    return ammount1 > ammount2;
}

function IsGreaterOrEqualThan(ammount1, ammount2)
{
    return ammount1 >= ammount2;
}

function IsEqual(ammount1, ammount2)
{
    return ammount1 == ammount2;
}

function IsNotEqual(ammount1, ammount2)
{
    return ammount1 != ammount2;
}

function IsLesserThan(ammount1, ammount2)
{
    return ammount1 < ammount2;
}

function IsLesserOrEqualThan(ammount1, ammount2)
{
    return ammount1 <= ammount2;
}

function dateToSql(date, sqlFormat = true)
{
  var separator = "";

  if(sqlFormat)
    separator = " ";
  else
    separator = "_"

  var year = date.getFullYear();
  var month = "0" + (date.getMonth() + 1);
  var day = "0" + date.getDate();
  var hour = "0" + date.getHours();
  var min = "0" + date.getMinutes();
  var sec = "0" + date.getSeconds();
  var time = year + '-' + month.substr(-2) + '-' + day.substr(-2) + separator + hour.substr(-2) + ':' + min.substr(-2) + ':' + sec.substr(-2) ;

  if(!sqlFormat)
    time = time.replace(':', '');

  return time;
}

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}