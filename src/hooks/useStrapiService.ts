import useStrapiData, { type UseStrapiDataResult } from './useStrapiData';
import type { StrapiServiceData } from '../types/strapi';
import { mapStrapiService } from '../utils/strapiMappers';

const useStrapiService = (): UseStrapiDataResult<StrapiServiceData> =>
  useStrapiData<StrapiServiceData>('/api/service?populate[services][populate]=*', mapStrapiService);

export default useStrapiService;
