export default class EmailService {
    static triggerEmail(data) {
        console.log('****************************** Calling Email Service ******************************');
        console.log('Payload', JSON.stringify(data, null, 2));
        console.log('***********************************************************************************');
    }
}
