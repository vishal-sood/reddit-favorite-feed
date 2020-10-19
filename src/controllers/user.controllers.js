import Joi from 'joi';

import { User } from '../models';
import { userSchema } from '../models/user.model';
import { JOI_VALIDATION_CONTEXT } from '../utils/constants';
import { prepareResponse } from '../utils/methods';

const requestBodySchema = userSchema.when('$type', {
    switch: [
        {
            is: JOI_VALIDATION_CONTEXT.CREATE_REQUEST,
            then: Joi.object({
                id: Joi.forbidden(),
                email: Joi.required(),
                name: Joi.required(),
                subredditIds: Joi.forbidden()
            })
        },
        {
            is: JOI_VALIDATION_CONTEXT.UPDATE_REQUEST,
            then: Joi.object({
                email: Joi.optional(),
                name: Joi.optional(),
                subredditIds: Joi.forbidden(),
                getNewsletter: Joi.optional(),
                newsletterTime: Joi.optional(),
                timezone: Joi.optional()
            })
        },
    ]
});

const createUser = async (ctx) => {
    let error, data;
    const requestData = ctx.request.body;
    const validatedData = requestBodySchema.validate(
        requestData, { abortEarly: false, context: { type: JOI_VALIDATION_CONTEXT.CREATE_REQUEST } }
    );
    error = validatedData.error;
    
    if (!error) {
        try {
            const userData = validatedData.value;
            const createdUser = User.upsert(userData);
            data = { user: createdUser };
        } catch (err) {
            error = err;
        }
    }

    ctx.body = prepareResponse(error, data);
};

const updateUser = async (ctx) => {
    let error, data;
    const { userId } = ctx.params;
    const requestData = ctx.request.body;
    const validatedData = requestBodySchema.validate(
        requestData, { abortEarly: false, context: { type: JOI_VALIDATION_CONTEXT.UPDATE_REQUEST } }
    );
    error = validatedData.error;
    
    if (!error) {
        try {
            const userData = validatedData.value;
            const updatedUser = User.updateById(userId, userData);
            data = { user: updatedUser };
        } catch (err) {
            error = err;
        }
    }

    ctx.body = prepareResponse(error, data);
};

export {
    createUser,
    updateUser
};
