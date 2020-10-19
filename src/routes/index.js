import installUserRoutes from './user.routes';
import installSubredditRoutes from './subreddit.routes';

export default function (app) {
    installUserRoutes(app);
    installSubredditRoutes(app);
};
