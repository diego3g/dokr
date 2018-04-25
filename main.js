const { app, Menu, Tray } = require('electron');
const { Docker } = require('node-docker-api');
const path = require('path');

const assetsDirectory = path.join(__dirname, 'assets');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

let tray = null;

function renderMenuItems(containers) {
  return containers.map((container, index) => {
    return { 
      type: 'normal',
      label: ` ${container.data.Image}`,
      icon: path.join(
        assetsDirectory, 
        `${container.data.State === 'running' ? 'online' : 'offline'}.png`
      ),
      async click() {
        if (container.data.State === 'running') {
          console.log(`Stopped container ${container.data.Image}`);
          await container.stop();
        } else { 
          console.log(`Started container ${container.data.Image}`);
          await container.start();
        }
  
        tray.setContextMenu(await renderMenu());
      },
    };
  });
}

async function renderMenu() {
  const containers = await docker.container.list({ all: true });
  // tray.setTitle(containers.length);

  const menu = renderMenuItems(containers);

  return Menu.buildFromTemplate(menu);
}

app.on('ready', async () => {
  tray = new Tray(path.join(assetsDirectory, 'trayTemplate.png'));

  tray.setContextMenu(await renderMenu());
});

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});
