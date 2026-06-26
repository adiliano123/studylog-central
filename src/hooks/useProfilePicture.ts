import { useState, useCallback } from "react";

const API = "http://localhost:8080";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function validateFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
    return "Unsupported format. Please use JPG, JPEG, PNG, or WEBP.";
  }
  if (file.size > MAX_BYTES) {
    return "File is too large. Maximum size is 5 MB.";
  }
  return null;
}

export function useProfilePicture() {
  const [isUploading, setIsUploading] = useState(false);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  /** Upload a new profile picture. Returns the new URL on success. */
  const upload = useCallback(async (file: File): Promise<string> => {
    const validationError = validateFile(file);
    if (validationError) throw new Error(validationError);

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API}/api/profile/picture`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Upload failed");
      }

      const data = await res.json();
      // Persist new URL into localStorage so other components can read it
      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        user.profileImageUrl = data.profileImageUrl;
        localStorage.setItem("user", JSON.stringify(user));
      }
      return data.profileImageUrl as string;
    } finally {
      setIsUploading(false);
    }
  }, []);

  /** Remove the profile picture. */
  const remove = useCallback(async (): Promise<void> => {
    setIsUploading(true);
    try {
      const res = await fetch(`${API}/api/profile/picture`, {
        method: "DELETE",
        headers: authHeader(),
      });

      if (!res.ok) throw new Error("Failed to remove profile picture");

      const raw = localStorage.getItem("user");
      if (raw) {
        const user = JSON.parse(raw);
        user.profileImageUrl = null;
        localStorage.setItem("user", JSON.stringify(user));
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { isUploading, upload, remove };
}
