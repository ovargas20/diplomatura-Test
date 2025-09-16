import express, { Application } from 'express';
import config from './config';
import router from './routes';
import { initializeDatabase } from './libs/db';

export class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.settings();
    this.middlewares();
    this.routes();
    this.initialSetup();
  }

  private settings() {
    this.app.set('port', config.port);
  }

  private middlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes() {
    this.app.use(router);
  }

  private initialSetup() {
    initializeDatabase();
  }

  async listen(): Promise<void> {
    this.app.listen(this.app.get('port'));
    if (process.env.NODE_ENV === 'production') {
      console.log(process.env.NODE_ENV);
    } else {
      console.log('Server on port', this.app.get('port'));
    }
  }
}
