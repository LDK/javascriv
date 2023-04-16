// Publish/pdfImages.ts
export const fetchImageAsDataURL = async (url: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error fetching image:', url, error);
    throw error;
  }
};

export const replaceRemoteImagesWithDataURLs = async (contentArray: any[]): Promise<any[]> => {
  const updatedContentArray = await Promise.all(
    contentArray.map(async (content) => {
      if (typeof content === 'string') {
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        const images = doc.querySelectorAll('img');

        const promises = [];

        for (const img of images) {
          const src = img.getAttribute('src');

          if (src && src.startsWith('http')) {
            const promise = fetchImageAsDataURL(src)
              .then((dataUrl) => {
                img.setAttribute('src', dataUrl);
              })
              .catch((error) => {
                console.warn(`Failed to fetch image: ${src}`, error);
              });
            promises.push(promise);
          }
        }

        await Promise.all(promises);
        return { html: doc.body.innerHTML, type: 'string' };
      } else {
        return content;
      }
    })
  );

  return updatedContentArray;
};
