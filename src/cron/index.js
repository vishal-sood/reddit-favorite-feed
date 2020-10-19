import { CronJob } from 'cron';

import { User } from '../models';

const newsLetterTriggerFunc = () => {
    const now = new Date();
    const timeOfDay = String(now.getUTCHours()).padStart(2, '0') + ':' + String(now.getUTCMinutes()).padStart(2, '0');

    User.triggerNewsletters(timeOfDay);
};

const newsLetterTriggerJob = new CronJob(
    '0,15,30,45 * * * *',
    newsLetterTriggerFunc,
    null,
    false,
    'GMT'
);

export {
    newsLetterTriggerJob
};
