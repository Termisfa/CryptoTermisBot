var mysql = require('mysql');

var pool;
var BotLog;


module.exports = class DatabaseHandler
{
    constructor(_BotLog)
    {
        BotLog = _BotLog

        pool = mysql.createPool({
            host     : 'mysqlcryptoserver',
            port     : '3306',
            database : 'cryptobot',
            user     : 'root',
            password : 'secret',
        });

        // pool = mysql.createPool({
        //     host     : 'localhost',
        //     port     : '33060',
        //     database : 'cryptobot',
        //     user     : 'root',
        //     password : 'secret',
        // });
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
    
    
    static from (BotLog) {
        return new this(BotLog)
      }
}
