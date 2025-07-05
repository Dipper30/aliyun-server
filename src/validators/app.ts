import BaseValidator from './base';
import { array, number, object, string } from 'aptx-validator';

class AppValidator extends BaseValidator {
  constructor() {
    super();
  }

  create() {
    return object({
      name: string().maxLength(50).errText('Invalid Name'),
      code: string().maxLength(30).errText('Invalid Code'),
      type: string().oneof(['page', 'server']).errText('Invalid Code'),
      info: object({}).optional(),
      gitRepo: string(),
      description: string().optional(),
    });
  }

  query() {
    return object({
      type: string()
        .oneof(['page', 'server'])
        .optional()
        .errText('Invalid Code'),
    });
  }
}

export default new AppValidator();
