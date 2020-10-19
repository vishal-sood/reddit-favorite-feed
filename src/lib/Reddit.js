import Axios from 'axios';

class Reddit {
    static _processSubredditRecords(data) {
        if (!data.length) return [];

        const processedPosts = data.map(value => {
            const post = value.data;
            const { title, ups, preview, permalink } = post;

            return { title, ups, preview, permalink };
        });
        return processedPosts;
    }

    static async fetchTopPostsForSubreddit(subredditName) {
        const url = `${this.BASE_URL}r/${subredditName}/top`;
        const params = { limit: this.POST_COUNT };

        let subreddit = { name: subredditName };
        try {
            const response = await Axios.get(url, { params });
            subreddit.posts = this._processSubredditRecords(response.data.data.children);
        } catch (err) {
            console.log(err);
        }

        return subreddit;
    }
}

Reddit.BASE_URL = 'https://api.reddit.com/';
Reddit.POST_COUNT = 3;

export default Reddit;
