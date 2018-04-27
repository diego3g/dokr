const { Menu, Tray } = require('electron');
const { Docker } = require('node-docker-api');
const path = require('path');

const assetsDirectory = path.join(__dirname, '..', 'assets');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

module.exports = class TrayMenu {
  constructor() {
    this.tray = new Tray(path.join(assetsDirectory, 'trayTemplate.png'));
    this.render();
  }

  renderRefresh() {
    return {
      click: this.render.bind(this),
      label: ' Refresh',
      icon: path.join(assetsDirectory, 'refreshTemplate.png'),
    };
  }

  renderQuit() {
    return {
      role: 'quit',
      label: ' Quit Dokr',
      icon: path.join(assetsDirectory, 'powerTemplate.png'),
    };
  }

  async renderContainers() {
    const containers = await docker.container.list({ all: true });
    const self = this;

    return containers.map((container, index) => {
      return { 
        type: 'normal',
        label: ` ${container.data.Image}`,
        icon: path.join(
          assetsDirectory, 
          `${container.data.State === 'running' ? 'online' : 'offline'}.png`
        ),
        async click(menuItem) {
          const isRunning = container.data.State === 'running';

          if (isRunning) {
            await container.stop();
          } else { 
            await container.start();
          }
    
          self.render();
        },
      };
    });
  }

  async render() {
    const menu = Menu.buildFromTemplate([
      this.renderRefresh(),
      { type: 'separator' },
      ...await this.renderContainers(),
      { type: 'separator' },
      this.renderQuit(),
    ]);

    this.tray.setContextMenu(menu);
  }
};
