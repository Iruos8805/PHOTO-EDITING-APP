import React, { useState, useEffect } from "react";
import ImageFilter from 'react-image-filter';
import * as htmlToImage from 'html-to-image';
import './index.css';

function App() {
  const [file, setFile] = useState(null);
  const [filterType, setFilterType] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [originalImageDimensions, setOriginalImageDimensions] = useState({ width: 0, height: 0 });

  function handleChange(e) {
    const uploadedFile = e.target.files[0];
    setFile(URL.createObjectURL(uploadedFile));
    setFilterType(null);

    // Get dimensions of the uploaded image
    const img = new Image();
    img.src = URL.createObjectURL(uploadedFile);
    img.onload = function () {
      setOriginalImageDimensions({ width: img.width, height: img.height });
    };

    const reader = new FileReader();
    reader.onload = function (event) {
      setGalleryImages(prevImages => [...prevImages, event.target.result]);
    };
    reader.readAsDataURL(uploadedFile);
  }

  function applyFilter(type) {
    setFilterType(type);
  }

  function getFilterMatrix(type) {
    switch (type) {
      case 'grayscale':
        return [
          1, 0, 0, 0, 0,
          1, 0, 0, 0, 0,
          1, 0, 0, 0, 0,
          0, 0, 0, 1, 0,
        ];

      case 'sepia':
        return [
          0.3, 0.45, 0.1, 0, 0,
          0.2, 0.45, 0.1, 0, 0,
          0.1, 0.3, 0.1, 0, 0,
          0, 0, 0, 1, 0,
        ];

      case 'invert':
        return [
          -1, 0, 0, 0, 1,
          0, -1, 0, 0, 1,
          0, 0, -1, 0, 1,
          0, 0, 0, 1, 0,
        ];

      default:
        return [];
    }
  }

  useEffect(() => {
    setImageLoaded(false); // Reset image loaded state on file change
  }, [file]);

  function handleDownload() {
    const node = document.getElementById('image-container');

    if (!imageLoaded) {
      console.log('Image not loaded yet');
      return; // Prevents downloading an empty image
    }

    htmlToImage.toPng(node, { width: originalImageDimensions.width, height: originalImageDimensions.height })
      .then(function (dataUrl) {
        setGalleryImages(prevImages => [...prevImages, dataUrl]);
        setSelectedImageIndex(galleryImages.length);
        const link = document.createElement('a');
        link.download = 'filtered-image.png';
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error) {
        console.error('Error generating image: ', error);
      });
  }

  function handleNext() {
    setSelectedImageIndex((prevIndex) => (prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1));
  }

  function handlePrevious() {
    setSelectedImageIndex((prevIndex) => (prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1));
  }

  return (
    <div className="App">
      <div className="title">
        <h2>EDITING AREA</h2>
      </div>
      <div className="desired">
        <p>ADD DESIRED FILTERS</p>
      </div>
      <div className="input">
        <label htmlFor="file-upload" className="custom-file-upload">
          Choose file
        </label>
        <input id="file-upload" type="file" onChange={handleChange} style={{ display: 'none' }} />
      </div>
      <br />
      <br />
      {!file && (
        <div style={{ width: '600px', height: '400px' }}></div>
      )}
      {file && (
        <div>
          <div className="image"
            id="image-container"
            style={{
              display: imageLoaded ? 'block' : 'none',
              maxWidth: '1920px',
              maxHeight: '1080px',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: '20px',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '0 auto',
            }}
          >
            <ImageFilter
              image={file}
              filter={filterType ? getFilterMatrix(filterType) : []}
              preserveAspectRatio="xMidYMid meet"
              style={{
                width: '100%',
                height: '100%',
              }}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          <br />
          <br />
          <div className="filterButtons">
            <button className="filterButton grayscale" onClick={() => applyFilter('grayscale')}>Grayscale</button>
            <button className="filterButton sepia" onClick={() => applyFilter('sepia')}>Sepia</button>
            <button className="filterButton invert" onClick={() => applyFilter('invert')}>Invert</button>
          </div>
        </div>
      )}
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        {file && (
          <button className="download" onClick={handleDownload}>Download</button>
        )}
      </div>
      <br />
      <br />
      <br />
      <div className="gallery">
        <h3>GALLERY</h3>
      </div>

      {galleryImages.length > 0 && (
        <div className="center-container">
          <div className="ThumbnailGallery">
            <img
              src={galleryImages[selectedImageIndex]}
              alt={`Thumbnail ${selectedImageIndex}`}
              style={{ width: '600px', height: '400px', margin: '5px' }}
            />
            <div className="navbuts">
              <button className="navbut previous" onClick={handlePrevious}>Previous</button>
              <button className="navbut next" onClick={handleNext}>Next</button>
            </div>
          </div>
        </div>
      )}

      <br />
      <br />
      <br />
      <div className="ThumbnailGallery">
        {galleryImages.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Thumbnail ${index}`}
            style={{ width: '250px', height: 'auto', margin: '5px', cursor: 'pointer' }}
            onClick={() => setSelectedImageIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
