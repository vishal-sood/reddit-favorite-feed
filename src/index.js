import Koa from 'koa';
import koaBody from 'koa-body';

import installRoutes from './routes';
import { newsLetterTriggerJob } from './cron';

const servicePort = 3000;

const app = new Koa();
app.use(koaBody());

installRoutes(app);
app.listen(servicePort, () => console.log(`running on port ${servicePort}`));

newsLetterTriggerJob.start();
