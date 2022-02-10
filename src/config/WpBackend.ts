import { isProductionWebsite } from "../util/DevEnvUtil";

export const PRODUCTION_BACKEND_BASE_URL = "https://";
export const TESTING_BACKEND_BASE_URL = "http://";

// export const BACKEND_BASE_URL = TESTING_BACKEND_BASE_URL;
export const BACKEND_BASE_URL = window.location.origin;

const useDummyDataConfig = false;
export const useDummyData = (useDummyDataConfig && !isProductionWebsite); // it means, do not use server/backend, in production never using dummy data
export const showAjaxRequestsResponses = true; // it means, do not use server/backend