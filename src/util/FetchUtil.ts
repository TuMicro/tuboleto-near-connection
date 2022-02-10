import { BACKEND_BASE_URL, showAjaxRequestsResponses } from "../config/WpBackend";

export const fetchWithWordpressAjax = async (data: {}) => {
  const res = await fetch(
    BACKEND_BASE_URL + '/wp-admin/admin-ajax.php', {
    method: 'POST',
    body: new URLSearchParams(data),
  });
  const responseData = await res.json();
  if (showAjaxRequestsResponses) {
    console.log(responseData);
  }
  return responseData;
};
