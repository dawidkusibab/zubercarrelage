import useStrapiData, { type UseStrapiDataResult } from './useStrapiData';
import type { StrapiHomeData } from '../types/strapi';
import { mapStrapiHome } from '../utils/strapiMappers';

const useStrapiHome = (): UseStrapiDataResult<StrapiHomeData> =>
  useStrapiData<StrapiHomeData>('/api/home?populate=*', mapStrapiHome);

export default useStrapiHome;
