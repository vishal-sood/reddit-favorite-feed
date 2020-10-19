import Router from 'koa-router';

import { addSubredditForUser, removeSubredditForUser } from '../controllers/subreddit.controllers';

const router = new Router();

router.post('/users/:userId/subreddits', addSubredditForUser);
router.delete('/users/:userId/subreddits/:subredditId', removeSubredditForUser);

export default function install(app) {
    app.use(router.routes());
    app.use(router.allowedMethods());
};
