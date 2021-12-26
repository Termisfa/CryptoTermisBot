

module.exports = function(BotLog, constants){
    class Helpers{
        static FormatDataFromHttpsToBd(parsedData, previousPrice)
        {
          try {
            let answer = new Array(60).join('-') + "\n";
        
            var emote = "";
        
            var actualPrice = parsedData.data.price.substr(0, constants.GetConstant('priceLength'))
        
            if(previousPrice != 0)
            {
              if(previousPrice < actualPrice)
                emote = " :point_up_2: "
              else
                emote = " :point_down: ";
            }
        
            answer += "Actualizado: `" + TimeConverter(parsedData.updated_at) + "`\n";
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
    
        static FormatChannelId(rawId)
        {
          return rawId.replace('<','').replace('>','').replace('#','');
        }

        static AlertTypeHandler(alertType)
        {
            switch (alertType) {
                case "SUBE": return '>='; break;
                case "BAJA": return '<='; break;
                    
                default:
                    break;
            }
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
        
    
        static UnixToSqlDatetime(UNIX_timestamp)
        {
          try {
            var date = new Date(UNIX_timestamp);
            return DateToSql(date);

            
          } catch (error) {
            BotLog(error, error, "UnixToSqlDatetime", true)
          }
        }

        static DateToSql(date)
        {
            return DateToSql(date);
        }

        static HourDifBetweenDates(date1, date2)
        {
            try {
                return Math.abs(date1 - date2) / 36e5; //36e5 is the scientific notation for 60*60*1000
            } catch (error) {
                BotLog(error, error, "HourDifBetweenDates", true)
            }
        }

        static AddHoursToDate(ammountHours, date)
        {
            try {
                return date.addHours(ammountHours)
            } catch (error) {
                BotLog(error, error, "AddHoursToDate", true)
            }
        }
        
        static  TimeConverter(UNIX_timestamp){
            return TimeConverter(UNIX_timestamp)
        }
    }

    
    return Helpers;
}


function TimeConverter(UNIX_timestamp)
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
        BotLog(error, error, "TimeConverter", true)
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

Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
  }

function DateToSql(date)
{
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDate();
    var hour = "0" + date.getHours();
    var min = "0" + date.getMinutes();
    var sec = "0" + date.getSeconds();
    var time = year + '-' + month + '-' + day + ' ' + hour.substr(-2) + ':' + min.substr(-2) + ':' + sec.substr(-2) ;
    return time;
}