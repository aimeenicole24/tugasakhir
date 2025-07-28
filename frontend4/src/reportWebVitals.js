import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

const reportWebVitals = (onPerfEntry) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);  // Event-based listener untuk CLS
    onFID(onPerfEntry);  // Event-based listener untuk FID
    onFCP(onPerfEntry);  // Event-based listener untuk FCP
    onLCP(onPerfEntry);  // Event-based listener untuk LCP
    onTTFB(onPerfEntry); // Event-based listener untuk TTFB
  }
};

export default reportWebVitals;
