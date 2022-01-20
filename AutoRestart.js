const schedule = require('node-schedule');
const fs = require('fs');



module.exports = {
  initiate: function () 
  {
    schedule.scheduleJob('55 * * * *', () => createFile()); //Cada hora al minuto 55
  }
};




function createFile()
{
  let ahora = new Date()
  let path = './checkerCrypto/'

  fs.closeSync(fs.openSync(path + ahora.getHours(), 'w'))

  ahora.setHours(ahora.getHours() - 1)

  path += ahora.getHours();

  if(fs.existsSync(path))
    fs.unlinkSync(path) //Borrar el archivo de la hora anterior si existe  
}