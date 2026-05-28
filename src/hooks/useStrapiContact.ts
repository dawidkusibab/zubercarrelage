import useStrapiData, { type UseStrapiDataResult } from './useStrapiData';
import type { StrapiContactData } from '../types/strapi';

const useStrapiContact = (): UseStrapiDataResult<StrapiContactData> =>
  useStrapiData<StrapiContactData>('/api/contact?populate=*');

export default useStrapiContact;
