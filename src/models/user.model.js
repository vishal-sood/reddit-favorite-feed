import Joi from 'joi';

import BaseModel from './base.model';
import {
    DEFAULT_TIME_OF_DAY,
    DEFAULT_TZ,
    JOI_VALIDATION_CONTEXT,
    TIMEZONE_REGEX,
    TIME_OF_DAY_REGEX
} from '../utils/constants';
import { getTimeOfDayInGMT } from '../utils/methods';
import Subreddit from './subreddit.model';
import Reddit from '../lib/Reddit';
import EmailService from '../lib/EmailService';

const userSchema = Joi.object({
    id: Joi.number().positive().integer(),
    email: Joi.string().email(),
    name: Joi.string().trim().pattern(/^[a-zA-Z0-9_-\s]+$/).max(30),
    subredditIds: Joi.array().items(
        Joi.number().positive().integer()
    ),
    getNewsletter: Joi.boolean(),
    newsletterTime: Joi.string().trim().pattern(TIME_OF_DAY_REGEX, 'allowed time values (XX:00, XX:15, XX:30, XX:45)'),
    timezone: Joi.string().trim().pattern(TIMEZONE_REGEX, 'valid timezone')
});

const userModelSchema = userSchema.when('$type', {
    is: JOI_VALIDATION_CONTEXT.MODEL_VALIDATION,
    then: Joi.object({
        id: Joi.required(),
        email: Joi.required(),
        name: Joi.required(),
        subredditIds: Joi.any().default([]),
        getNewsletter: Joi.any().default(true),
        newsletterTime: Joi.any().default(DEFAULT_TIME_OF_DAY),
        timezone: Joi.any().default(DEFAULT_TZ),
        newsletterTimeGMT: Joi.required().failover(DEFAULT_TIME_OF_DAY)
    })
});

class User extends BaseModel {
    static async triggerNewsletters(timeOfDay) {
        if (!timeOfDay || !TIME_OF_DAY_REGEX.test(timeOfDay)) return;

        const users = this.find({ getNewsletter: true, newsletterTimeGMT: timeOfDay });
        if (!users) return;

        const usersData = await Promise.all(users.map(async (user) => {
            const subredditNameList = user.subredditIds.map(id => Subreddit.findById(id).name);
            const favoriteSubreddits = await Promise.all(subredditNameList.map(
                subreddit => Reddit.fetchTopPostsForSubreddit(subreddit)
            ));

            return {
                name: user.name,
                email: user.email,
                favoriteSubreddits
            }
        }));

        Promise.all(usersData.map(userData => EmailService.triggerEmail(userData)));
    }
}
User.init('user', userModelSchema);
User.beforeValidate = function (user) {
    user.newsletterTimeGMT = getTimeOfDayInGMT(user.newsletterTime, user.timezone);
};

export default User;
export {
    userSchema
};
