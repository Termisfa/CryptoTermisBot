var mysql = require('mysql');

var pool;
var BotLog;
var dbCon;

var dictionary;


module.exports = class Constants
{
    constructor(_BotLog, _dbCon)
    {
        BotLog = _BotLog
        dbCon = _dbCon

        InitializeDict();
    }

    

    GetConstant(key)
    {
        try {
            return dictionary[key];
        } catch (error) {
            BotLog(error, error, "GetConstant", true)
        }
    }

    DeleteConstant(key)
    {
        try {
            var sql = "delete from constants where name = '" + key + "'";
            dbCon.ExecuteQuery(sql);
        } catch (error) {
            BotLog(error, error, "DeleteConstant", true)
        }
    }

    SetConstant(key, value)
    {
        try {
            var sql = "select * from constants where name = '" + key + "'";

            dbCon.ExecuteQueryAsync(sql, (table,err) => {
                if(!err)
                {
                    var sql2;
                    if(table.length == 0)
                        sql2 = "insert into constants values('" + key + "', '" + value + "')"
                    else
                        sql2 = "update constants set text = '" +  value + "' where name = '" + key + "'"

                    dbCon.ExecuteQuery(sql2);
                    dictionary[key] = value;
                }
                else
                    BotLog(err, err, "InitializeDict", true)
            });


        } catch (error) {
            BotLog(error, error, "SetConstant", true)
        }
    }
    
    ListConstants()
    {
        var result = "";

        Object.entries(dictionary).forEach(([key, value]) => {
            result += key + ":    `" + value +"` \n";
         });

        return result;
    }
    
    
    static from (_BotLog, _dbCon) {
        return new this(_BotLog, _dbCon)
      }

    
}

function InitializeDict()
{
    dictionary = new Object();

    var sql = "select * from constants";

    dbCon.ExecuteQueryAsync(sql, (table,err) => {
        if(!err)
        {
            table.forEach(row => {
                dictionary[row.name] = row.text;
            });
        }
        else
            BotLog(err, err, "InitializeDict", true)
    });
}