export function openWhatsapp(text: string, phonenumber: string = "51959141274") {
  const url = "https://wa.me/" +
    phonenumber +
    "?text=" +
    encodeURIComponent(text);

  // abrir link en nueva pestaña
  window.open(url, '_blank')?.focus();
}