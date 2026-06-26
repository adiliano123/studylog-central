import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, Trash2, RefreshCw, X } from "lucide-react";
import { useProfilePicture, validateFile } from "@/hooks/useProfilePicture";

interface ProfilePictureUploadModalProps {
  open: boolean;
  onClose: () => void;
  currentImageUrl?: string | null;
  firstName?: string;
  lastName?: string;
  /** Called after a successful upload or removal with the new URL (null = removed) */
  onSuccess: (newImageUrl: string | null) => void;
}

const ProfilePictureUploadModal = ({
  open,
  onClose,
  currentImageUrl,
  firstName = "",
  lastName = "",
  onSuccess,
}: ProfilePictureUploadModalProps) => {
  const { toast } = useToast();
  const { isUploading, upload, remove } = useProfilePicture();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({ title: "Invalid file", description: error, variant: "destructive" });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const newUrl = await upload(selectedFile);
      toast({ title: "Profile picture updated", description: "Your new photo is live." });
      onSuccess(newUrl);
      handleClose();
    } catch (err: unknown) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemove = async () => {
    try {
      await remove();
      toast({ title: "Profile picture removed" });
      onSuccess(null);
      handleClose();
    } catch {
      toast({ title: "Failed to remove picture", variant: "destructive" });
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" /> Profile Picture
          </DialogTitle>
          <DialogDescription>
            Upload a photo (JPG, PNG, WEBP — max 5 MB).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          {/* Preview — plain img or camera placeholder, no Avatar component */}
          <div className="relative">
            {(preview ?? currentImageUrl) ? (
              <div className="relative">
                <img
                  key={preview ?? currentImageUrl ?? ""}
                  src={
                    preview
                      ? preview
                      : `http://localhost:8080${currentImageUrl}?v=${encodeURIComponent(currentImageUrl!)}`
                  }
                  alt="Profile preview"
                  className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/10"
                />
                {preview && (
                  <button
                    type="button"
                    aria-label="Clear selection"
                    onClick={() => {
                      setPreview(null);
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center ring-4 ring-primary/10">
                <Camera className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* File input */}
          <div className="w-full">
            <Label htmlFor="profile-pic-input" className="sr-only">Choose image</Label>
            <input
              id="profile-pic-input"
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
              aria-label="Upload profile picture"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4" />
              {preview ? "Choose different photo" : "Choose photo"}
            </Button>
          </div>

          {selectedFile && (
            <p className="text-xs text-muted-foreground">
              {selectedFile.name} · {(selectedFile.size / 1024).toFixed(0)} KB
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Remove existing */}
          {currentImageUrl && !preview && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isUploading}
              onClick={handleRemove}
              className="gap-1.5"
            >
              {isUploading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Remove photo
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="gap-1.5"
            >
              {isUploading
                ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Uploading…</>
                : <><Upload className="h-3.5 w-3.5" /> Save photo</>
              }
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureUploadModal;
