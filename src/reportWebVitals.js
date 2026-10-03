const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(mod => {
      const onCLS = mod.onCLS || mod.getCLS;
      const onFCP = mod.onFCP || mod.getFCP;
      const onLCP = mod.onLCP || mod.getLCP;
      const onTTFB = mod.onTTFB || mod.getTTFB;
      const onINP = mod.onINP || mod.onFID || mod.getFID;

      if (onCLS) onCLS(onPerfEntry);
      if (onFCP) onFCP(onPerfEntry);
      if (onLCP) onLCP(onPerfEntry);
      if (onTTFB) onTTFB(onPerfEntry);
      if (onINP) onINP(onPerfEntry);
    });
  }
};

export default reportWebVitals;
