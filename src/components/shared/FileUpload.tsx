import { useCallback } from "react";
import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = ".csv", 
  maxSize = 10,
  className = ""
}: FileUploadProps) {
  const { toast } = useToast();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (!file) return;
    
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Please select a file smaller than ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate file type
    if (accept && !file.name.toLowerCase().endsWith(accept.replace('.', ''))) {
      toast({
        title: "Invalid file type",
        description: `Please select a ${accept} file`,
        variant: "destructive",
      });
      return;
    }
    
    onFileSelect(file);
  }, [onFileSelect, accept, maxSize, toast]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-semibold mb-2">Upload your payout CSV</h3>
      <p className="text-muted-foreground mb-4">
        Drag and drop your file here, or click to browse
      </p>
      
      <input
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      
      <Button variant="outline" asChild>
        <label htmlFor="file-upload" className="cursor-pointer">
          <File className="w-4 h-4 mr-2" />
          Select File
        </label>
      </Button>
      
      <div className="mt-4 space-y-1">
        <p className="text-xs text-muted-foreground">
          • Max file size: {maxSize}MB
        </p>
        <p className="text-xs text-muted-foreground">
          • Processed locally in your browser
        </p>
        <p className="text-xs text-muted-foreground">
          • Data is never uploaded to our servers
        </p>
      </div>
    </div>
  );
}