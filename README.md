## Reddit Favorite Feed
This is a service that allows users to recieve their favorite subreddits' feed as an e-mail newsletter. This is supposed to work in tandem with an e-mail service which will generate the newsletter and send it via e-mail. _(More info can be found [here](https://github.com/Audibene-GMBH/ta.backend-coding-challenge#our-part))_

This service manages the user info and their favorite subreddits, and triggers the email service with the data required to render the newsletter at a time of user's choice. The newsletter is supposed to have top 3 posts from each of the subreddits that a user has added to their list.

This has the following major functionalities:
* Create and update users
* Add and remove a users' favorite subreddits
* Set a user's preferred time to receive the newsletter
* Turn on and off the newsletter for any user
* Invoke the e-mail service with the required data at the user's specified time everyday

## API

> ###  ___User___

> * __Add a user__ - `POST /users`
>   * Parameters
>       | name | type | description |
>       |------|------|-------------|
>       |email|_string_|[__required__] user's e-mail addess - newsletter will be sent to this e-mail)
>       |name|_string_|[__required__] user's name - used to address the user in the newsletter
>       |getNewsletter|_boolean_|[__optional__] denotes if the user wants to receive the newsletter or not (_defaults to `true`_)
>       |newsletterTime|_string_|[__optional__] time at which the user wants to receive the email; only __quarters of an hour__ are allowed ___{XX:00, XX:15, XX:30, XX:45}___ (_defaults to `"08:00"`_)
>       |timezone|_string_|[__optional__] user's timezone offset; allowed formats :<br/> - only hour (example: "-02", "+3")<br/> - hour and minutes (example: "-02:30", "+5:45") <br/>(_defaults to `"-7"`_)
>
>   * Returns
>       >The created `user` object<br/>
>
>       The `user` object has 2 (two) additional field to the ones listed in parameters - <br/>
>       - `subredditIds` - a list of IDs of user's subreddits _(NOTE: this ID is the identifier in the service's data & not the identifier used by Reddit)_<br/>
>       - `newsletterTimeGMT` - the user's specified time converted to time of day in GMT

> * __Update a user__ - `PATCH /users/{user_id}`
>   * Parameters
>       | name | type | description |
>       |------|------|-------------|
>       |email|_string_|[__optional__] user's e-mail address
>       |name|_string_|[__optional__] user's name
>       |getNewsletter|_boolean_|[__optional__] receive the newsletter or not - set to `true`, if you want to receive newsletter; `false`, if you want to stop receiving it
>       |newsletterTime|_string_|[__optional__] update time to receive the newsletter e-mail; only __quarters of an hour__ are allowed ___{XX:00, XX:15, XX:30, XX:45}___
>       |timezone|_string_|[__optional__] update user's timezone offset; allowed formats :<br/> - only hour (example: "-02", "+3")<br/> - hour and minutes (example: "-02:30", "+5:45")
>
>   * Returns
>       >The updated `user` object

> ###  ___Subreddit___

> * __Add a subreddit to user's list__ - `POST /users/{user_id}/subreddits`<br/>
>   This endpoint allows you to add the subreddit in 2 formats, viz.<br/>
>   1. using the subreddits name _(example: "funny", "gaming")_<br/>
>   2. using subreddit ID _(NOTE: this is the ID in the service's data)_<br/>
>
>   When you use a subreddit's name, it's ID is used if it exists in the DB; otherwise an entry for that subreddit is created and the newly created entry's ID is used
>
>
>   * Parameters (using subreddit `name`)
>       | name | type | description |
>       |------|------|-------------|
>       |name|_string_|[__required__] the subreddit's name (example: "funny", "worldnews")
>
>   * Parameters (using subreddit ID)
>       | name | type | description |
>       |------|------|-------------|
>       |id|_number_|[__required__] the subreddit's ID
>
>   * Returns
>       >The updated `user` object<br/>
>

> * __Remove a subreddit from user's list__ - `DELETE /users/{user_id}/subreddits/{subreddit_id}`<br/>
>   This enpoint allows a user to remove a subreddit from their list using the subreddit's ID
>
>   * Returns
>       >The updated `user` object<br/>
>

## Triggering the Newsletter
The service has a cron job that runs every 15 mins (quarters of an hour) and finds a list of all the users who should be sent a newsletter at that time. It then calls the Reddit API to find that posts for each user and then mocks triggering the e-mail service with that data (just logs the data to `console`).

The format of the data sent to the e-mail service is as follows:
| name | description |
|------|-------------|
|___email___| user's e-mail addess
|___name___| user's name
|___favoriteSubreddits___| a list (_array_) of subreddit data - one entry per user's favorite subreddit
<br/>

Each entry in _`favoriteSubreddits`_ has the following properties:
| name | description |
|------|-------------|
|___name___| the subreddit's name
|___posts___| a list (_array_) of subreddit posts [3 posts per subreddit - as per current configuration]
<br/>

Each _`post`_ in turn the following data:
| name | description |
|------|-------------|
|___title___| the post's title
|___ups___| number of upvotes on the post
|___preview___| data for media preview (image sources, etc.)
|___permalink___| a [permanent] link to the post

> NOTE: The fields inside a post are picked directly from the Reddit API response and the description is based on my understanding of the response (was unable to find a reliable doc explaining the response structure) - if something feels odd, feel free to refer the Reddit docs! :D

## Running the project
1. Install dependencies
```sh
npm install
```

2. Build & run the project
```sh
npm start
```

The service will start listening for requests at [`http://localhost:3000`](http://localhost:3000)
> NOTE: In case you wish to test this by plugging-in an actual e-mail service, please delete the files inside the `./db` folder. Since they have random email addresses (supposedly non-existent, but you never know!), this might lead to emails being triggered to unsuspecting people.

---

## Some additonal info (w.r.t the assignment)
- I decided to proceed without using a formal DB in order to make the service self-contained and keep things simple and minimalistic. Thus, I have used files for storing the data.
- Since, there is no formal DB, I wrote a basic `BaseModel` class which allows me to interact with the files. But, this is not very optimised and the files are read and written for every query/data operation. But the signatures of the methods are such that we can swap in a proper DB library with very less effort.
- With respect to time constraints and to keep things simple for the scope of the assignment, there is no caching of Reddit API results and no optimizations are done to reduce the API calls. One call per subreddit entry per user is made. We could try to reduce the number of calls by figuring out if there are any overlapping subreddits for users' whose newsletters are triggered at the same time. But, this hasn't been implemented as of yet.
- For sake of keeping things simple, I did not use any environment configs. Some stuff, such as the service's port and other configurable aspects like number of posts per subreddit or maybe Reddit API key (if a need arises to use it) could be placed in environment-based config files.
