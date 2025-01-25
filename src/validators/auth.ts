import BaseValidator from './base';
import { array, number, object, string } from 'aptx-validator';
import { paginationProperty } from './helpers';

class AuthValidator extends BaseValidator {
  constructor() {
    super();
  }

  login() {
    return object({
      username: this.username().errText('invalid username'),
      password: string().errText('invalid password'),
    });
  }

  autoLogin() {
    return object({
      token: string().errText('Token Required'),
    });
  }

  getUsers() {
    return object({
      id: number().optional().id().errText('Invalid ID'),
      username: string().optional().errText('Invalid Username'),
      rid: number().optional().errText('Invalid Role ID'),
      ...paginationProperty(true),
    });
  }

  getUsernameAvailability() {
    return object({
      username: this.username().errText('Invalid Username'),
    });
  }

  createAccount() {
    return object({
      username: this.username().errText('Invalid Username'),
      password: this.password().errText('Invalid Password'),
      rid: number().errText('Invalid Role ID'),
    });
  }

  updateUserAuth() {
    return object({
      uid: number().id().errText('Invalid UID'),
      auth: array(number()).errText('Invalid Auth'),
    });
  }

  updateUserAccount() {
    return object({
      username: this.username().errText('Invalid Username'),
      password: this.password().errText('Invalid Password'),
      newPassword: this.password().errText('Invalid New Password'),
    });
  }

  createAuthority() {
    return object({
      id: number().id().errText('Invalid ID'),
      name: string().errText('Invalid Name'),
      description: string().maxLength(50).optional(),
    });
  }

  getAuthorities() {
    return object({
      id: number().id().optional().errText('Invalid ID'),
      name: string().optional().errText('Invalid Name'),
    });
  }

  updateAuthority() {
    return object({
      id: number().id().errText('Invalid ID'),
      name: string().optional().errText('Invalid Name'),
      description: string().maxLength(50).optional(),
    });
  }

  createRole() {
    return object({
      id: number().id().errText('Invalid ID'),
      name: string().errText('Invalid Name'),
      description: string().maxLength(50).optional(),
      auth: array(number()).errText('Auth Array Required'),
    });
  }

  getRoles() {
    return object({
      id: number().id().optional(),
      name: string().optional().errText('Invalid Name'),
    });
  }

  updateRole() {
    return object({
      id: number().id(),
      name: string().optional().errText('Invalid Name'),
      description: string().optional().errText('Invalid Name'),
      auth: array(number()).errText('Invalid Auth'),
    });
  }

  updateUserRole() {
    return object({
      id: number().id(),
      rid: number().id().errText('Invalid Role ID'),
    });
  }
}

export default new AuthValidator();
