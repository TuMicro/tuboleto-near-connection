export const isLocalhost = (window.location.hostname === "127.0.0.1"
  || window.location.hostname === "localhost"
  || window.location.hostname === "::1");
export const isProductionWebsite = !isLocalhost;

console.log("isLocalhost", isLocalhost);