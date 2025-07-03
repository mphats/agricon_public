
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileText, Image, Archive, AlertCircle } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type TrainingFileType = Database['public']['Enums']['training_file_type'];

export const FileUploader = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Fetch datasets for dropdown
  const { data: datasets } = useQuery({
    queryKey: ['training-datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_datasets')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // File upload mutation
  const uploadFiles = useMutation({
    mutationFn: async (data: { files: File[]; datasetId: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const uploadPromises = data.files.map(async (file) => {
        // Upload to storage
        const filePath = `${data.datasetId}/${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('training-data')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get file type
        const getFileType = (filename: string): TrainingFileType => {
          const ext = filename.split('.').pop()?.toLowerCase();
          switch (ext) {
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
              return 'image';
            case 'pdf':
              return 'pdf';
            case 'csv':
              return 'csv';
            case 'json':
              return 'json';
            case 'zip':
            case 'rar':
              return 'zip';
            default:
              return 'image'; // default
          }
        };

        // Insert file record
        const { error: dbError } = await supabase
          .from('training_files')
          .insert({
            dataset_id: data.datasetId,
            filename: file.name,
            file_path: filePath,
            file_type: getFileType(file.name),
            file_size: file.size,
            metadata: {
              originalName: file.name,
              size: file.size,
              lastModified: file.lastModified
            }
          });

        if (dbError) throw dbError;

        return { filename: file.name, status: 'success' };
      });

      return Promise.all(uploadPromises);
    },
    onSuccess: (results) => {
      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${results.length} files for training.`,
      });
      setFiles([]);
      setSelectedDataset('');
      setUploadProgress({});
      queryClient.invalidateQueries({ queryKey: ['training-datasets'] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
      console.error('Upload error:', error);
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (!selectedDataset) {
      toast({
        title: "Dataset Required",
        description: "Please select a dataset before uploading files.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "Files Required",
        description: "Please select files to upload.",
        variant: "destructive",
      });
      return;
    }

    uploadFiles.mutate({ files, datasetId: selectedDataset });
  };

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'application/pdf') return <FileText className="h-4 w-4" />;
    if (type.includes('zip') || type.includes('rar')) return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">File Upload</h2>
        <p className="text-gray-600">Upload training data files (images, PDFs, ZIP archives)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Training Files</CardTitle>
          <CardDescription>
            Select a dataset and upload files for AI model training
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dataset Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Target Dataset</label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger>
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets?.map((dataset) => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-gray-500 mb-4">
              Supports: Images (JPG, PNG), PDFs, CSV, JSON, ZIP archives
            </p>
            <input
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.csv,.json,.zip,.rar"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Browse Files
              </label>
            </Button>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploadFiles.isPending || files.length === 0 || !selectedDataset}
              className="flex items-center gap-2"
            >
              {uploadFiles.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Files
                </>
              )}
            </Button>
          </div>

          {/* Upload Progress */}
          {uploadFiles.isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Uploading files...</span>
                <span className="text-sm text-gray-500">
                  Processing {files.length} files
                </span>
              </div>
              <Progress value={33} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Upload Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p><strong>Images:</strong> High-resolution photos of plant diseases, pests, or healthy crops</p>
            <p><strong>PDFs:</strong> Research papers, documentation, or labeled datasets</p>
            <p><strong>ZIP Archives:</strong> Compressed collections of training data</p>
            <p><strong>CSV/JSON:</strong> Structured data with labels and metadata</p>
          </div>
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Maximum file size: 50MB per file</p>
            <p>• Ensure files are properly labeled for best training results</p>
            <p>• ZIP files will be automatically extracted and processed</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
