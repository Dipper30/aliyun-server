import { AllValidator, number, object, Infer } from 'aptx-validator';

type GetType<F extends () => AllValidator> = Infer<ReturnType<F>>;

export const postTest = () => {
  return object({
    id: number().errText('number required').errText('ID required'),
  });
};
export type PostTestParams = GetType<typeof postTest>;
