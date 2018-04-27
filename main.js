const { app, Tray } = require('electron');
const TrayMenu = require('./lib/tray');

app.on('ready', async () => {
  new TrayMenu();
});

process.on('unhandledRejection', function(reason, p){
  console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging here
});