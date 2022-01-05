
var dbCon;
var Helpers;

module.exports = function(BotLog, _dbCon, _Helpers){

    dbCon = _dbCon;
    Helpers = _Helpers;

    class DbBackup
    {
        static GetBackup(callback)
        {
            var counter = 0;

            var sqlTables = "show tables";

            dbCon.ExecuteQueryAsync(sqlTables, (tables) => {
                LoopTables(tables, (result, maxCount) => {
                    counter ++;
                    if(counter == maxCount)
                        callback(result)
                });
            });
        }
    }
    
    return DbBackup;
}

function LoopTables(tables, callback)
{
    var result = "";
    tables.forEach(tableName => {
        TableInserts(tableName.Tables_in_cryptobot, (InsertByTable) => {
            result += InsertByTable + "\n\n\n\n";
            callback(result, tables.length)
        });
    });
}


function TableInserts(tableName, callback)
{
    var result = "--" + tableName + "\n\n";

    result += Helpers.DateToSql(new Date())  + "\n\n";

    result += "delete from " + tableName + ";\n\n";

    dbCon.ExecuteQueryAsync("select * from " + tableName, (table) => {
               
        table.forEach(row => {

            var arrayRow = Object.entries(row);

            result += "insert into " + tableName + " values (";

            arrayRow.forEach(element => {
                var field;

                if(typeof(element[1]) != "object"  || element[1] == null )
                    field = element[1]
                else
                    field = Helpers.DateToSql(new Date(element[1]));

                result += "'" + field + "',";
            });

            result = result.substring(0, result.length - 1);
            result += "); \n"

            
        });

        callback(result);
    });
}



