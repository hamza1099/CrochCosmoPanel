const ACCESS_KEY = import.meta.env.VITE_BUNNY_STORAGE_ACCESS_KEY;
const STORAGE_ZONE = import.meta.env.VITE_BUNNY_STORAGE_ZONE;
const CDN_URL = import.meta.env.VITE_BUNNY_CDN_URL;
const REGION = import.meta.env.VITE_BUNNY_REGION || ""; // e.g., "ny." or "sg."

// Using standard Fetch API for browser compatibility instead of Node.js SDK
const REGION_URL = `https://${REGION}storage.bunnycdn.com`;

export const uploadToBunny = async (file: File, folder: string = "uploads"): Promise<string> => {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const filePath = `/${folder}/${fileName}`;
  const url = `${REGION_URL}/${STORAGE_ZONE}${filePath}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "AccessKey": ACCESS_KEY,
        "Content-Type": file.type || "application/octet-stream"
      },
      body: file
    });
    
    if (!response.ok) {
      throw new Error(`Bunny storage upload failed: ${response.statusText}`);
    }
    
    return `${CDN_URL}${folder}/${fileName}`;
  } catch (error) {
    console.error("Bunny upload error:", error);
    throw error;
  }
};

export const deleteFromBunny = async (fileUrl: string): Promise<void> => {
  if (!fileUrl.startsWith(CDN_URL)) return; // Only delete if it's from our CDN

  const filePath = fileUrl.replace(CDN_URL, "/");
  const url = `${REGION_URL}/${STORAGE_ZONE}${filePath}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "AccessKey": ACCESS_KEY
      }
    });
    
    if (!response.ok && response.status !== 404) {
      throw new Error(`Bunny storage delete failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Bunny delete error:", error);
    throw error;
  }
};
