import useStrapiData, { type UseStrapiDataResult } from './useStrapiData';
import type { StrapiStatisticData } from '../types/strapi';

const useStrapiStatistic = (): UseStrapiDataResult<StrapiStatisticData> =>
  useStrapiData<StrapiStatisticData>('/api/statistic?populate=*');

export default useStrapiStatistic;
