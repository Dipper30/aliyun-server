import { number, object } from 'aptx-validator';

class V1 {
  postTest() {
    return object({
      id: number().errText('number required').errText('ID required'),
    });
  }
}

export default new V1();
