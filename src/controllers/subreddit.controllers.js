import Joi from 'joi';

import { Subreddit, User } from '../models';
import { subredditSchema } from '../models/subreddit.model';
import { prepareResponse } from '../utils/methods';

const getSubredditId = (subredditData, createIfNotExists = false) => {
    if (!Number.isNaN(Number(subredditData))) { // id is passed
        if (!Subreddit.findById(subredditData)) {
            throw new Error(`Subreddit with ID "${subredditData}" does not exist`);
        }

        return subredditData;
    } else { // subreddit data passed
        const subredditEntries = Subreddit.find(subredditData);
        if (subredditEntries && subredditEntries.length) return subredditEntries[0].id;

        if (createIfNotExists) return Subreddit.upsert(subredditData).record.id;
    }

    return null;
};

const subredditValidationSchema = Joi.alternatives([
    Joi.object({ id: Joi.number().positive().integer().required() }), // allow subredditId to be passed
    subredditSchema.append({ // allow subreddit name to be passe - subreddit will be created if not exists already
        id: Joi.forbidden()
    })
]);
const addSubredditForUser = async (ctx) => {
    let error, data;
    const { userId } = ctx.params;
    const requestData = ctx.request.body;
    const validatedData = subredditValidationSchema.validate(
        requestData, { abortEarly: false }
    );
    error = validatedData.error;
    
    if (!error) {
        try {
            let userEntry = User.findById(userId);
            if (!userEntry) throw new Error(`User with ID "${userId}" not found`);

            const subredditData = validatedData.value;
            const newSubredditId = getSubredditId(subredditData, true);

            const { subredditIds } = userEntry;
            if (!subredditIds.includes(newSubredditId)) {
                subredditIds.push(newSubredditId);
            }

            const updatedUser = User.updateById(userId, { subredditIds });
            data = { user: updatedUser };
        } catch (err) {
            error = err;
        }
    }

    ctx.body = prepareResponse(error, data);
};

const removeSubredditForUser = async (ctx) => {
    let error, data;
    const { userId, subredditId: subredditIdToRemove } = ctx.params;

    try {
        let userEntry = User.findById(userId);
        if (!userEntry) throw new Error(`User with ID "${userId}" not found`);

        if (Number.isNaN(Number(subredditIdToRemove))) {
            throw new Error(`Invalid value "${subredditIdToRemove}" for subreddit id`);
        }

        let { subredditIds } = userEntry;
        subredditIds = subredditIds.filter(val => val != subredditIdToRemove);

        const updatedUser = User.updateById(userEntry.id, { subredditIds });
        data = { user: updatedUser };
    } catch (err) {
        error = err;
    }

    ctx.body = prepareResponse(error, data);
};

export {
    addSubredditForUser,
    removeSubredditForUser
};
