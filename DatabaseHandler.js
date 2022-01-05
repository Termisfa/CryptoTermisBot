var mysql = require('mysql');

var pool;
var BotLog;


module.exports = class DatabaseHandler
{
    constructor(_BotLog, _host, _port, _database, _user, _passw)
    {
        BotLog = _BotLog

        pool = mysql.createPool({
            host     : _host,
            port     : _port,
            database : _database,
            user     : _user,
            password : _passw,
        });
    }

    ExecuteQueryAsync(sql, callback)
    {
        try {
            pool.getConnection(function(err, connection) {
                if(err) {
                        BotLog(err, err, "ExecuteQueryAsync", true)
                    }
                connection.query(sql, function(err, results) {
                  connection.release(); // always put connection back in pool after last query
                  if(err){
                            console.log("Error al ejecutar query: " + sql)
                            console.log(err);
                            return callback(err);
                        }
                  callback(results);
                });
            });
        } catch (error) {
            BotLog("Error al ejecutar query: " + sql, err, "ExecuteQueryAsync", true)
        }
        
    }

    ExecuteQuery(sql)
    {
        try {
            pool.getConnection(function(err, connection) {
                if(err) {
                        BotLog(err, err, "ExecuteQuery", true)
                    }
                connection.query(sql, function(err, results) {
                  connection.release(); // always put connection back in pool after last query
                  if(err){
                        BotLog(err, err, "ExecuteQuery", true)
                        console.log(err);
                        }
                });
            });
        } catch (error) {
            BotLog("Error al ejecutar query: " + sql, err, "ExecuteQuery", true)
        }
    }
    
    
    static from (BotLog, host, port, database, user, passw) {
        return new this(BotLog, host, port, database, user, passw)
      }
}
