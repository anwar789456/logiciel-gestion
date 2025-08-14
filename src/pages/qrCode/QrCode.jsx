import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { FetchAllProductItems } from '../../api/product';
import { toPng, toJpeg } from 'html-to-image';
import { useTranslation } from 'react-i18next';

export default function QrCode() {
  const { t } = useTranslation();
  const [id, setId] = useState('');
  const [qrValue, setQrValue] = useState('');
  const [textInput, setTextInput] = useState('');
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const qrCodeRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await FetchAllProductItems();
        const uniqueProducts = Array.from(new Map(data.map(item => [item.idProd, item])).values());
        setProducts(uniqueProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenerateQRCodeFromSelect = () => {
    if (id.trim() !== '') {
      setQrValue(`https://samethome.com/ProductPage/${id}`);
    }
  };

  const handleGenerateQRCodeFromText = () => {
    if (textInput.trim() !== '') {
      setQrValue(textInput);
    }
  };

  const handleCancelQRCode = () => {
    setQrValue('');
    setId('');
    setTextInput('');
    setSearch('');
  };

  const handleDownloadQRCode = (format = 'png') => {
    if (!qrCodeRef.current) return;

    switch (format) {
      case 'png':
        toPng(qrCodeRef.current, { quality: 1 })
          .then((dataUrl) => downloadImage(dataUrl, 'Qrcode.png'));
        break;
      case 'jpeg':
        toJpeg(qrCodeRef.current, { quality: 1 })
          .then((dataUrl) => downloadImage(dataUrl, 'Qrcode.jpg'));
        break;
      case 'svg':
        downloadSVG();
        break;
    }
  };

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  // const downloadSVG = () => {
  //   // Create an SVG element
  //   const svgElement = document.querySelector('.qr-code > svg');
    
  //   if (!svgElement) return;

  //   // Clone the SVG to avoid modifying the original
  //   const clonedSvg = svgElement.cloneNode(true);
    
  //   // Create a serialized string of the SVG
  //   const svgString = new XMLSerializer().serializeToString(clonedSvg);
    
  //   // Create a Blob from the SVG string
  //   const blob = new Blob([svgString], { type: 'image/svg+xml' });
    
  //   // Create a download link
  //   const link = document.createElement('a');
  //   link.href = URL.createObjectURL(blob);
  //   link.download = 'Qrcode.svg';
  //   link.click();
  // };

  const downloadSVG = () => {
    const svgElement = qrCodeRef.current?.querySelector('svg');
    if (!svgElement) {
      console.error('SVG element not found');
      return;
    }
    const clonedSvg = svgElement.cloneNode(true);
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Qrcode.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  const handleSelectProduct = (product) => {
    setId(product.idProd);
    setSearch(product.nom);
    setIsDropdownOpen(false);
  };

  return (
    <div className="pt-4">
      <div className='pb-4 pl-8 flex justify-between items-center border-b border-gray-200 dark:border-gray-700'>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            {t('qr_code_generator')}
          </h1>
        </div>
      </div>
      
      <div className='bg-white dark:bg-gray-800 max-w-3xl mx-auto mt-0.5'>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mb-0.5" ref={dropdownRef}>
          <h2 className="text-xl font-semibold mb-1 text-gray-700 dark:text-white">{t('generate_from_product')}</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-0">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder={t('search_products')} 
                value={search} 
                onChange={(e) => {
                  setSearch(e.target.value);
                  setIsDropdownOpen(true);
                }} 
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full p-3 border text-gray-600 dark:text-gray-400 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {products.length === 0 ? (
                    <div className="p-3 text-gray-500">{t('no_products_found')}</div>
                  ) : (
                    products
                      .filter((product) => product.nom.toLowerCase().includes(search.toLowerCase()))
                      .map((product) => (
                        <div 
                          key={product.idProd} 
                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0" 
                          onClick={() => handleSelectProduct(product)}
                        >
                          <span className="font-medium">{product.idProd}</span> - {product.nom}
                        </div>
                      ))
                  )}
                </div>
              )}
            </div>
            <button 
              onClick={handleGenerateQRCodeFromSelect} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap"
              disabled={!id.trim()}
            >
              {t('generate_qr_code_from_product')}
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mb-0.5">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-white">{t('generate_from_text')}</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <input 
              type="text" 
              placeholder={t('enter_any_text_or_url')} 
              value={textInput} 
              onChange={(e) => setTextInput(e.target.value)} 
              className="flex-1 p-3 border text-shadow-gray-600 dark:text-gray-400 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
            />
            <button 
              onClick={handleGenerateQRCodeFromText} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap"
              disabled={!textInput.trim()}
            >
              {t('generate_qr_code')}
            </button>
          </div>
        </div>

        {qrValue && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mb-6">
            <div className="flex justify-between items-center mb-0">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">{t('your_qr_code')}</h2>
              <button 
                onClick={handleCancelQRCode} 
                className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              >
                {t('clear')}
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <div ref={qrCodeRef} className="bg-white p-3 rounded-lg shadow-sm mb-2 inline-block">
                <QRCode value={qrValue} size={300} />
              </div>
              
              <div className="text-sm text-gray-500 mb-4 max-w-md text-center">
                <p>{t('qr_code_content')}: <span className="font-medium break-all">{qrValue}</span></p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <button 
                  onClick={() => handleDownloadQRCode('png')} 
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('download_png')}
                </button>
                <button 
                  onClick={() => handleDownloadQRCode('jpeg')} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('download_jpg')}
                </button>
                <button 
                  onClick={() => handleDownloadQRCode('svg')} 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {t('download_svg')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
