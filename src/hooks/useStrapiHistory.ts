import useStrapiData, { type UseStrapiDataResult } from './useStrapiData';
import type { StrapiHistoryData } from '../types/strapi';
import { mapStrapiHistory } from '../utils/strapiMappers';

const useStrapiHistory = (): UseStrapiDataResult<StrapiHistoryData> =>
  useStrapiData<StrapiHistoryData>('/api/history?populate=*', mapStrapiHistory);

export default useStrapiHistory;
