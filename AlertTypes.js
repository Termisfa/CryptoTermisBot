var BotLog;

var arrayUp;
var arrayDown;


module.exports = class AlertTypes
{
    constructor(_BotLog)
    {
        BotLog = _BotLog

        InitializeArrays();
    }

    GetAlertType(alertTypeWord)
    {
        alertTypeWord = alertTypeWord.toUpperCase().trim()

        if(arrayUp.includes(alertTypeWord))
            return "UP";
        else if(arrayDown.includes(alertTypeWord))
            return "DOWN"
    }

    IsValidAlert(alertTypeWord)
    {
        if(arrayUp.includes(alertTypeWord) || arrayDown.includes(alertTypeWord))
            return true;
        else
            return false;
    }

    GetWordsUp()
    {
        return arrayUp.join();
    }
    
    GetWordsDown()
    {
        return arrayDown.join();
    }

    GetAlertSigne(alertTypeWord)
    {
        if(arrayUp.includes(alertTypeWord))
            return '>=';
        else if(arrayDown.includes(alertTypeWord))
            return '<='
    }

    MessageWrongAlertTypeWord(alertTypeWord)
    {
        var msg = "La palabra `" + alertTypeWord + "` no es válida \n";

        msg += "Palabras válidas de subida: `" + this.GetWordsUp() + "` \n";
        msg += "Palabras válidas de bajada: `" + this.GetWordsDown() + "`";
    }
    
    
    static from (_BotLog) {
        return new this(_BotLog)
      }

    
}

function InitializeArrays()
{
    arrayUp = ["SUBE", "S", "SUBIDA", "UP", "U", "ARRIBA", "ENCIMA"];
    arrayDown = ["BAJA", "B", "BAJADA", "DOWN", "D", "ABAJO", "DEBAJO"];
}