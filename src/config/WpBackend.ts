import { isProductionWebsite } from "../util/DevEnvUtil";

export const PRODUCTION_BACKEND_BASE_URL = 'https://us-central1-tumicro-1203.cloudfunctions.net/pd-usuario';
export const TESTING_BACKEND_BASE_URL = 'https://us-central1-tumicro-1203.cloudfunctions.net/pd-usuario_alfa';
export const LOCALHOST_BACKEND_BASE_URL = 'http://localhost:5001/tumicro-1203/us-central1/pd-usuario_alfa';

// export const BACKEND_BASE_URL = TESTING_BACKEND_BASE_URL;
export const BACKEND_BASE_URL =
  isProductionWebsite ?
    // PRODUCTION_BACKEND_BASE_URL 
    TESTING_BACKEND_BASE_URL 
    :
    // LOCALHOST_BACKEND_BASE_URL
    TESTING_BACKEND_BASE_URL
  ;

const useDummyDataConfig = false;
export const useDummyData = (useDummyDataConfig && !isProductionWebsite); // it means, do not use server/backend, in production never using dummy data
export const showAjaxRequestsResponses = true; // it means, do not use server/backend