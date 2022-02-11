import { BACKEND_BASE_URL } from "../config/WpBackend";
import { isProductionWebsite } from "../util/DevEnvUtil";

const showAjaxRequestsResponses = !isProductionWebsite;

export const requestPing = async (data: {}, 
  ) => {
  const res = await fetch(
    BACKEND_BASE_URL + '/receive/nearrecharge_ping_tbe01_23', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const responseData = await res.json();
  if (showAjaxRequestsResponses) {
    console.log(responseData);
  }
  return responseData;
};
