function jqTest() {
  // @ts-ignore
  const l = jQuery(".page-title").html();
  
  console.log(l); // this was tested to be working!! (after importing jquery in index.html)
}

export function getJquery() : any {
  // @ts-ignore
  return jQuery as any;
}

// DO NOT use this, instead use: https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider
export function getWeb3() : any {
  // @ts-ignore
  return web3 as any;
}