import BaseService from './base';

class Home extends BaseService {
  transporter: any;

  constructor() {
    super();
  }

  async getDailyActiveUsers(): Promise<number[][]> {
    return [
      [1682524800, 10],
      [1682438400, 20],
      [1682352000, 30],
      [1682265600, 2],
      [1682179200, 1],
      [1682092800, 12],
      [1682006400, 30],
    ];
  }

  async getMonthlyActiveUsers(): Promise<number[][]> {
    return [
      [1680278400, 180],
      [1677600000, 250],
      [1675180800, 520],
      [1672502400, 330],
      [1669824000, 400],
      [1667232000, 220],
    ];
  }

  async getCurrentActiveUsers() {
    const users = await this.models.user.findAll({
      attributes: ['id', 'username'],
      raw: true,
    });
    return users;
  }
}

export default new Home();
