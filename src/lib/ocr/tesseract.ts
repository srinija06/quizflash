
// In a real app, we'd use Tesseract.js for OCR
// For this prototype, we'll create a mock OCR service

export const ocrService = {
  recognizeText: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Simulate OCR processing delay
      setTimeout(() => {
        try {
          const reader = new FileReader();
          
          reader.onload = () => {
            // In a real app, we'd process the image using Tesseract.js
            // For this prototype, we'll just return some mock text based on the filename
            const fileName = file.name.replace(/\.(png|jpg|jpeg|gif|bmp)$/i, '');
            
            const mockContent = `
              Extracted text from image: ${fileName}
              
              This appears to be a document related to ${fileName} with the following content:
              
              The image contains text explaining concepts about ${fileName} and its related topics.
              Key points identified:
              • Important terminology
              • Definitions of core concepts
              • Examples of practical applications
              • Summary of main principles
              
              The quality of the image affects OCR accuracy. For better results, use high-resolution images
              with clear text and good contrast.
            `;
            
            resolve(mockContent);
          };
          
          reader.onerror = () => {
            reject(new Error('Failed to read image file'));
          };
          
          reader.readAsArrayBuffer(file);
        } catch (error) {
          reject(error);
        }
      }, 2000); // Simulate OCR processing delay
    });
  }
};
