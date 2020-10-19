import fs from 'fs';
import path from 'path';

import { capitalizeFirstLetter, cloneDataObject, filterCollection } from '../utils/methods';
import { JOI_VALIDATION_CONTEXT } from '../utils/constants';

const DB_DIRECTORY = path.resolve(__dirname, '../../db');

export default class BaseModel {
    static init(name, validationSchema) {
        this.modelname = capitalizeFirstLetter(name);
        this.filename = `${name}.json`;
        this._assertFile();
        this.validate = (data) => validationSchema.validate(
            data, { abortEarly: false, context: { type: JOI_VALIDATION_CONTEXT.MODEL_VALIDATION} }
        );
    }

    static Error(name, err) {
        return new Error(`[${this.modelname} Error]: ${name}${err ? `\n${JSON.stringify(err, null, 4)}` : ''}`);
    }

    static get filepath() {
        return path.resolve(DB_DIRECTORY, this.filename);
    }

    static _assertFile() {
        const data = {
            nextId: 0,
            collection: {}
        };

        try {
            fs.writeFileSync(this.filepath, JSON.stringify(data), { flag: 'wx' });
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
        }
    }

    static _readFile() {
        const rawData = fs.readFileSync(this.filepath);
        return JSON.parse(rawData);
    }

    static _writeFile(data) {
        fs.writeFileSync(this.filepath, JSON.stringify(data));
    }

    static _operationWrapper(operation) {
        const data = this._readFile();
        const returnValue = operation(data);
        this._writeFile(data);

        return returnValue;
    }

    static findById(id) {
        return this._operationWrapper((data) => {
            const { collection } = data;
            
            let onlyOne = false;
            if (!Array.isArray(id)) {
                onlyOne = true;
                id = [ id ];
            }

            const result = filterCollection(
                collection, record => id.includes(String(record.id)) || id.includes(Number(record.id))
            );
            return result.length ? (onlyOne ? result[0] : result) : null;
        });
    }

    static find(filters = {}) {
        return this._operationWrapper((data) => {
            const { collection } = data;

            const filterFunc = (record) => {
                for (let key in filters) {
                    if ((key in record) && record[key] !== filters[key]) return false;
                }
                return true;
            };

            const result = filterCollection(collection, filterFunc);
            return result.length ? result : null;
        });
    }

    static upsert(record) {
        return this._operationWrapper((function (data) {
            let inserted = false;
            if (!record.id) {
                inserted = true;
                record.id = ++data.nextId
            };

            if (this.beforeValidate && typeof this.beforeValidate === 'function') {
                this.beforeValidate(record);
            }
            const { value: validatedValue, error } = this.validate(record);

            if (error) {
                throw this.Error('Invalid data', error.details[0].message);
            }


            data.collection[record.id] = validatedValue;
            return { inserted, record: validatedValue }
        }).bind(this));
    }

    static updateById(id, dataToUpdate) {
        return this._operationWrapper((function (data) {
            let record = data.collection[id];
            if (!record) throw this.Error(`Record with ID "${id}" not found`);
            record = cloneDataObject(record);

            for (let key in dataToUpdate) {
                if (key !== 'id' && key in record) {
                    record[key] = dataToUpdate[key];
                }
            }
            
            if (this.beforeValidate && typeof this.beforeValidate === 'function') {
                this.beforeValidate(record);
            }

            const { value: validatedValue, error } = this.validate(record);
            if (error) {
                throw this.Error('Invalid data', error.details[0].message);
            }

            data.collection[record.id] = validatedValue;
            return { record: validatedValue };
        }).bind(this));
    }

    static removeById(id) {
        return this._operationWrapper((data) => {
            const deleted = data.collection[id] !== undefined;
            delete data.collection[id];

            return { deleted };
        });
    }
};
