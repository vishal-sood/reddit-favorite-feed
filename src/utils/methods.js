import {
    DEFAULT_TIME_OF_DAY,
    DEFAULT_TZ,
    TIMEZONE_REGEX,
    TIME_OF_DAY_REGEX
} from './constants';

const filterCollection = (collection, filterFunc) => {
    const result = [];
    for (let key in collection) {
        if (filterFunc(collection[key])) {
            result.push(collection[key]);
        }
    }

    return result;
};

const capitalizeFirstLetter = (str) => {
    if (typeof str !== 'string' || !str) return str;
    return str[0].toUpperCase() + str.slice(1);
};

const cloneDataObject = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

const getTimeOfDayInGMT = (timeOfDay, timezone) => {
    if (!timeOfDay && !timezone) return DEFAULT_TIME_OF_DAY;
    timeOfDay = timeOfDay || DEFAULT_TIME_OF_DAY;
    timezone = timezone || DEFAULT_TZ;
    
    const timeComponents = timeOfDay.match(TIME_OF_DAY_REGEX);
    if (!timeComponents || timeComponents.length !== 3) {
        throw new Error('Invalid value for time of day');
    }

    const timezoneComponents = timezone.match(TIMEZONE_REGEX);
    // length = 3 => '-7'
    // length = 4 => '-7:00'
    if (!timezoneComponents || (timezoneComponents.length !== 3 && timezoneComponents.length !== 4)) {
        throw new Error('Invalid value for timezone');
    }

    let [hour, minute] = timeComponents.slice(1);
    let [sign, hourOffset, minuteOffset = 0] = timezoneComponents.slice(1);

    minute = Number(minute) - Number(`${sign}${minuteOffset}`);
    if (minute < 0) {
        minute += 60;
        hour = Number(hour) - 1;
    } else if (minute >= 60) {
        minute -= 60;
        hour = Number(hour) + 1;
    }

    hour = Number(hour) - Number(`${sign}${hourOffset}`);
    if (hour < 0) hour += 24;
    else if (hour >= 24) hour -= 24;

    return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
};

const prepareResponse = (err, data) => {
    if (!err) {
        return {
            status: 'success',
            message: 'Success',
            data
        };
    }
    
    return {
        status: 'failed',
        message: err.message || 'Unknown Server Error'
    };
};

export {
    capitalizeFirstLetter,
    cloneDataObject,
    filterCollection,
    getTimeOfDayInGMT,
    prepareResponse
};
