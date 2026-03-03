import React, { useCallback, useRef, useState } from "react";
import { uploadImageWithProgress } from "../../lib/cloudinary";
import { Trash2, UploadCloud } from "lucide-react";

interface UploadedImage {
  url: string;
  publicId: string;
}

interface ImageUploaderProps {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  maxImages = 4,
}) => {
  const [uploading, setUploading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);

      if (value.length + fileArray.length > maxImages) {
        alert(`Maximum ${maxImages} images allowed`);
        return;
      }

      setUploading(true);

      try {
        for (const file of fileArray) {
          const tempId = `${file.name}-${Date.now()}`;

          const result = await uploadImageWithProgress(file, (percent) => {
            setProgressMap((prev) => ({
              ...prev,
              [tempId]: percent,
            }));
          });

          onChange([
            ...value,
            {
              url: result.secure_url,
              publicId: result.public_id,
            },
          ]);

          setProgressMap((prev) => {
            const updated = { ...prev };
            delete updated[tempId];
            return updated;
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, maxImages]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Drop Area */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-500 transition"
      >
        <UploadCloud className="mx-auto mb-3 text-slate-400" size={28} />
        <p className="text-sm text-slate-600">
          Drag & drop images here or click to upload
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Max {maxImages} images
        </p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Upload Progress */}
      {Object.keys(progressMap).length > 0 && (
        <div className="space-y-2">
          {Object.entries(progressMap).map(([key, percent]) => (
            <div key={key} className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.map((img, index) => (
          <div key={img.publicId} className="relative group">
            <img
              src={img.url}
              alt="Uploaded"
              className="w-full h-32 object-cover rounded-xl"
              loading="lazy"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      {uploading && (
        <p className="text-xs text-slate-500">Uploading images...</p>
      )}
    </div>
  );
};

export default ImageUploader;