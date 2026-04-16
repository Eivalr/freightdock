// Carrier tracking URL patterns
// {ID} is replaced with the container/BL number
const CARRIERS = [
  {
    code: 'MAEU',
    name: 'Maersk',
    prefixes: ['MAEU','MSKU','MCPU','MAEI','MRKU','MMAU','MSCU'],
    color: '#42B0D5',
    logo: 'M',
    containerUrl: 'https://www.maersk.com/tracking/{ID}',
    blUrl: 'https://www.maersk.com/tracking/{ID}'
  },
  {
    code: 'CMDU',
    name: 'CMA CGM',
    prefixes: ['CMAU','CGMU','APZU','CGMU','CAXU','APHU'],
    color: '#E30613',
    logo: 'C',
    containerUrl: 'https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=Container&Reference={ID}',
    blUrl: 'https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=BillOfLading&Reference={ID}'
  },
  {
    code: 'MSCU',
    name: 'MSC',
    prefixes: ['MSCU','MEDU','MSDU','MTXU','TCKU','GLDU','BMOU','TRHU'],
    color: '#FF6B00',
    logo: 'M',
    containerUrl: 'https://www.msc.com/en/track-a-shipment?trackingNumber={ID}',
    blUrl: 'https://www.msc.com/en/track-a-shipment?trackingNumber={ID}'
  },
  {
    code: 'COSU',
    name: 'COSCO',
    prefixes: ['COSU','CBHU','CCLU','CSNU','FCIU','IPXU'],
    color: '#003087',
    logo: 'C',
    containerUrl: 'https://elines.coscoshipping.com/ebusiness/cargotracking/trackingByContainerNo?containerNo={ID}',
    blUrl: 'https://elines.coscoshipping.com/ebusiness/cargotracking/trackingByBillNo?blNo={ID}'
  },
  {
    code: 'YMLU',
    name: 'Yang Ming',
    prefixes: ['YMLU','YMJU','YEGU','YCSU'],
    color: '#005BAA',
    logo: 'Y',
    containerUrl: 'https://www.yangming.com/e-service/Track_Trace/track_trace_cargo_tracking.aspx?SearchType=BNO&CNTR_NO={ID}',
    blUrl: 'https://www.yangming.com/e-service/Track_Trace/track_trace_cargo_tracking.aspx?SearchType=BNO&CNTR_NO={ID}'
  },
  {
    code: 'EISU',
    name: 'Evergreen',
    prefixes: ['EISU','EMCU','EGHU','ECMU','EGSU','TEMU'],
    color: '#009250',
    logo: 'E',
    containerUrl: 'https://www.evergreen-line.com/eservice/public/tare.do?func=TARE&segNo=&cntrNo={ID}',
    blUrl: 'https://www.evergreen-line.com/eservice/public/tare.do?func=TARE&blNo={ID}'
  },
  {
    code: 'HLCU',
    name: 'Hapag-Lloyd',
    prefixes: ['HLCU','HLXU','UXXU','GLDU'],
    color: '#E2001A',
    logo: 'H',
    containerUrl: 'https://www.hapag-lloyd.com/en/online-business/tracing/tracing-by-container.html?container={ID}',
    blUrl: 'https://www.hapag-lloyd.com/en/online-business/tracing/tracing-by-booking.html?bl={ID}'
  },
  {
    code: 'ZIMU',
    name: 'ZIM',
    prefixes: ['ZIMU','ZCSU','BMOU'],
    color: '#00539F',
    logo: 'Z',
    containerUrl: 'https://www.zim.com/tools/track-a-shipment?consnumber={ID}',
    blUrl: 'https://www.zim.com/tools/track-a-shipment?consnumber={ID}'
  },
  {
    code: 'ONEY',
    name: 'ONE',
    prefixes: ['ONEY','KKFU','NYKU','MOFU','MOLU','POCU','YMPU'],
    color: '#E4003A',
    logo: 'O',
    containerUrl: 'https://ecomm.one-line.com/ecom/CUP_HOM_3301.do?f_cmd=533&cust_no=&cntr_no={ID}',
    blUrl: 'https://ecomm.one-line.com/ecom/CUP_HOM_3301.do?f_cmd=533&cust_no=&bl_no={ID}'
  },
  {
    code: 'HDMU',
    name: 'HMM',
    prefixes: ['HDMU','HMMU','HJCU'],
    color: '#003366',
    logo: 'H',
    containerUrl: 'https://www.hmm21.com/e-service/general/tracking/TrackingByContainer.do?containerNo={ID}',
    blUrl: 'https://www.hmm21.com/e-service/general/tracking/TrackingByBL.do?blNo={ID}'
  }
];

// Auto-detect carrier from container prefix (first 4 chars)
function detectCarrier(input) {
  const prefix = input.trim().toUpperCase().substring(0, 4);
  return CARRIERS.find(c => c.prefixes.includes(prefix)) || null;
}

// Detect if input looks like a container number (4 letters + 7 digits)
function isContainerNumber(input) {
  return /^[A-Z]{4}\d{7}$/i.test(input.trim());
}

window.CARRIERS = CARRIERS;
window.detectCarrier = detectCarrier;
window.isContainerNumber = isContainerNumber;
