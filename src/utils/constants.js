const DEFAULT_TIME_OF_DAY = '08:00';
const DEFAULT_TZ = '-7';
const TIME_OF_DAY_REGEX = /^(2[0-3]|[01][0-9]|[0-9]):(00|15|30|45)$/;
const TIMEZONE_REGEX = /^([+-])(1[0-4]|[0][0-9]|[0-9])(?::(00|30|45))?$/;
const JOI_VALIDATION_CONTEXT = {
    CREATE_REQUEST: 'create-request',
    UPDATE_REQUEST: 'update-request',
    MODEL_VALIDATION: 'model-validation'
};

export {
    DEFAULT_TIME_OF_DAY,
    DEFAULT_TZ,
    JOI_VALIDATION_CONTEXT,
    TIME_OF_DAY_REGEX,
    TIMEZONE_REGEX
};
