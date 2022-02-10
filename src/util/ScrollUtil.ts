export function scrollToTop() {
  window.scrollTo(0, 0);
}
export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView(true);
}
export function scrollToSelector(selector: string) {
  document.querySelector(selector)?.scrollIntoView(true);
}