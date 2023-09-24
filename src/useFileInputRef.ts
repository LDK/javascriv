import { useState } from "react";

const useFileInputRef = () => {
  const [fileInputRef, setFileInputRef] = useState<HTMLInputElement | null>(null);
  return { fileInputRef, setFileInputRef };
}

export default useFileInputRef;