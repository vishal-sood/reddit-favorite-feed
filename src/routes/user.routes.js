import Router from 'koa-router';

import { createUser, updateUser } from '../controllers/user.controllers';

const router = new Router();

router.post('/users', createUser);
router.patch('/users/:userId', updateUser);

export default function install(app) {
    app.use(router.routes());
    app.use(router.allowedMethods());
};
