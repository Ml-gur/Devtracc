import React, { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Code, 
  Download,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { getDemoMode } from '../utils/supabase/client';

interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
  category: 'image' | 'document' | 'code' | 'other';
}

interface FileUploadManagerProps {
  projectId: string;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  onFilesChange?: (files: FileItem[]) => void;
}

export default function FileUploadManager({ 
  projectId, 
  allowedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp'],
  maxFileSize = 10,
  onFilesChange 
}: FileUploadManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing files (demo implementation)
  React.useEffect(() => {
    loadProjectFiles();
  }, [projectId]);

  const loadProjectFiles = async () => {
    if (getDemoMode()) {
      // Demo files
      const demoFiles: FileItem[] = [
        {
          id: 'demo-file-1',
          name: 'project-mockup.png',
          size: 2048000,
          type: 'image/png',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
          uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'image'
        },
        {
          id: 'demo-file-2',
          name: 'project-requirements.pdf',
          size: 1024000,
          type: 'application/pdf',
          url: '#',
          uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'document'
        },
        {
          id: 'demo-file-3',
          name: 'api-documentation.md',
          size: 512000,
          type: 'text/markdown',
          url: '#',
          uploadedAt: new Date().toISOString(),
          category: 'document'
        }
      ];
      setFiles(demoFiles);
    }
  };

  const getFileCategory = (type: string): 'image' | 'document' | 'code' | 'other' => {
    if (type.startsWith('image/')) return 'image';
    if (type.includes('pdf') || type.includes('doc') || type.includes('text')) return 'document';
    if (type.includes('javascript') || type.includes('typescript') || 
        type.includes('python') || type.includes('java')) return 'code';
    return 'other';
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'code': return <Code className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Size check
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Type check
    const isValidType = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.name.endsWith(type) || file.type === type;
    });

    if (!isValidType) {
      return `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const handleFileSelect = async (selectedFiles: FileList) => {
    setError(null);
    
    const fileArray = Array.from(selectedFiles);
    const validFiles = [];
    const errors = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    await uploadFiles(validFiles);
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        if (getDemoMode()) {
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 10) {
            setUploadProgress(((i / filesToUpload.length) * 100) + (progress / filesToUpload.length));
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Add demo file
          const newFile: FileItem = {
            id: `demo-file-${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.type.startsWith('image/') 
              ? URL.createObjectURL(file) 
              : '#',
            uploadedAt: new Date().toISOString(),
            category: getFileCategory(file.type)
          };

          setFiles(prev => [...prev, newFile]);
        } else {
          // Real implementation would upload to Supabase Storage
          // const { data, error } = await supabase.storage
          //   .from('project-files')
          //   .upload(`${projectId}/${file.name}`, file);
          
          console.log('Would upload file to Supabase Storage:', file.name);
        }
      }

      onFilesChange?.(files);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      if (getDemoMode()) {
        setFiles(prev => prev.filter(f => f.id !== fileId));
      } else {
        // Real implementation would delete from Supabase Storage
        console.log('Would delete file from Supabase Storage:', fileId);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete file. Please try again.');
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, []);

  const categoryStats = files.reduce((acc, file) => {
    acc[file.category] = (acc[file.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Project Files
          </CardTitle>
          <CardDescription>
            Upload and manage project resources, images, and documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {dragActive ? 'Drop files here' : 'Drag and drop files here'}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse your files
              </p>
              <p className="text-xs text-muted-foreground">
                Max file size: {maxFileSize}MB • Allowed types: Images, PDFs, Documents, Code files
              </p>
            </div>
            
            <Input
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="mt-4 max-w-xs mx-auto"
            />
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading files...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File Statistics */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">File Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{files.length}</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{categoryStats.image || 0}</div>
                <div className="text-sm text-muted-foreground">Images</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{categoryStats.document || 0}</div>
                <div className="text-sm text-muted-foreground">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{categoryStats.code || 0}</div>
                <div className="text-sm text-muted-foreground">Code Files</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{file.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {file.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • 
                      Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.category === 'image' && file.url !== '#' && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Implementation Note */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Production Note:</strong> File upload functionality is currently in demo mode. 
          In production, this will integrate with Supabase Storage for secure file management, 
          automatic image optimization, and proper access controls.
        </AlertDescription>
      </Alert>
    </div>
  );
}