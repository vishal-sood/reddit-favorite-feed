import Joi from 'joi';

import BaseModel from './base.model';
import { JOI_VALIDATION_CONTEXT } from '../utils/constants';

const subredditSchema = Joi.object({
    id: Joi.number().positive().integer(),
    name: Joi.string().trim().max(30).required()
});

const subredditModelSchema = subredditSchema.when('$type', {
    is: JOI_VALIDATION_CONTEXT.MODEL_VALIDATION,
    then: Joi.object({
        id: Joi.required()
    })
});

class Subreddit extends BaseModel {}
Subreddit.init('subreddit', subredditModelSchema);

export default Subreddit;
export {
    subredditSchema
};
