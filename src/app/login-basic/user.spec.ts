/* tslint:disable:no-unused-variable */

import {User} from './user';

describe('User', () => {
  it('should create an instance', () => {
    expect(new User()).toBeTruthy();
  });

  it('should accept values in the constructor', () => {
    const user = new User({
      username: 'user',
      authorities: [{authority: 'ROLE_USER'}],
      password: 'password',
    });
    expect(user.username).toEqual('user');
    expect(user.authorities[0].authority).toEqual('ROLE_USER');
    expect(user.authorization).toEqual('');
    expect(user.password).toEqual('password');
  });
});
