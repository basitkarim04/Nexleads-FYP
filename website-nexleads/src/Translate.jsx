import React, { useEffect, useRef } from 'react';

const Translate = () => {
  const googleTranslateRef = useRef(null);

  useEffect(() => {
    const addGoogleTranslateScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    };

    // Function to initialize Google Translate widget
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        googleTranslateRef.current
      );
    };

    // Inject the Google Translate script
    addGoogleTranslateScript();
  }, []);

  return <div  ref={googleTranslateRef} className='translate-container'>

  </div>;
};

export default Translate;
