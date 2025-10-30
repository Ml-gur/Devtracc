import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  X, 
  FileText, 
  Download,
  Eye,
  Copy,
  ExternalLink,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FileUpload {
  id: string;
  file: File;
  type: 'image' | 'document' | 'other';
  preview?: string;
  uploadProgress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  loading: boolean;
  error?: string;
}

interface MessageFileManagerProps {
  onFileUpload: (files: FileUpload[]) => void;
  onLinkAdd: (link: LinkPreview) => void;
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  maxFiles?: number;
}

export default function MessageFileManager({
  onFileUpload,
  onLinkAdd,
  maxFileSize = 10,
  allowedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.zip'],
  maxFiles = 5
}: MessageFileManagerProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkPreview, setLinkPreview] = useState<LinkPreview | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'links'>('files');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileType = (file: File): 'image' | 'document' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf') || 
        file.type.includes('document') || 
        file.type.includes('text') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.txt')) return 'document';
    return 'other';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowedType = allowedFileTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      return file.type.match(type.replace('*', '.*'));
    });
    
    if (!isAllowedType) {
      return 'File type not allowed';
    }
    
    return null;
  };

  const createFilePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => resolve(undefined);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  const handleFileSelect = async (files: FileList) => {
    if (uploads.length + files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newUploads: FileUpload[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validationError = validateFile(file);
      
      if (validationError) {
        alert(`${file.name}: ${validationError}`);
        continue;
      }

      const preview = await createFilePreview(file);
      
      const upload: FileUpload = {
        id: `upload-${Date.now()}-${i}`,
        file,
        type: getFileType(file),
        preview,
        uploadProgress: 0,
        status: 'pending'
      };
      
      newUploads.push(upload);
    }

    setUploads(prev => [...prev, ...newUploads]);
    
    // Simulate upload progress
    newUploads.forEach(upload => {
      simulateUpload(upload.id);
    });
  };

  const simulateUpload = (uploadId: string) => {
    setUploads(prev => prev.map(upload => 
      upload.id === uploadId 
        ? { ...upload, status: 'uploading' }
        : upload
    ));

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, uploadProgress: 100, status: 'completed' }
            : upload
        ));
      } else {
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, uploadProgress: progress }
            : upload
        ));
      }
    }, 200);
  };

  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, []);

  const fetchLinkPreview = async (url: string) => {
    if (!url.trim()) return;
    
    setLinkPreview({
      url,
      loading: true
    });

    try {
      // Simulate link preview fetch (in real app, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock preview data
      const mockPreviews: { [key: string]: Partial<LinkPreview> } = {
        'github.com': {
          title: 'GitHub Repository',
          description: 'Build software better, together',
          favicon: 'https://github.com/favicon.ico',
          image: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
        },
        'stackoverflow.com': {
          title: 'Stack Overflow',
          description: 'Where developers learn, share, & build careers',
          favicon: 'https://stackoverflow.com/favicon.ico',
          image: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/apple-touch-icon.png'
        },
        'medium.com': {
          title: 'Medium Article',
          description: 'A place to read and write on topics that matter',
          favicon: 'https://medium.com/favicon.ico',
          image: 'https://miro.medium.com/max/1200/1*5-aoK8IBmXve5whBQM90GA.png'
        }
      };

      const domain = new URL(url).hostname.replace('www.', '');
      const mockData = mockPreviews[domain] || {
        title: 'Web Page',
        description: 'External link'
      };

      setLinkPreview({
        url,
        loading: false,
        ...mockData
      });
    } catch (error) {
      setLinkPreview({
        url,
        loading: false,
        error: 'Failed to load preview'
      });
    }
  };

  const addLink = () => {
    if (linkPreview && !linkPreview.error) {
      onLinkAdd(linkPreview);
      setLinkUrl('');
      setLinkPreview(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Share Files & Links</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'files' | 'links')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files" className="flex items-center space-x-2">
              <File className="h-4 w-4" />
              <span>Files</span>
              {uploads.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {uploads.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center space-x-2">
              <LinkIcon className="h-4 w-4" />
              <span>Links</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="space-y-4">
            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload Files</h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Max {maxFileSize}MB per file • Up to {maxFiles} files
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
              >
                Choose Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept={allowedFileTypes.join(',')}
                onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              />
            </div>

            {/* File List */}
            {uploads.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {uploads.map((upload) => (
                  <Card key={upload.id} className="p-4">
                    <div className="flex items-start space-x-3">
                      {upload.preview ? (
                        <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                          <ImageWithFallback
                            src={upload.preview}
                            alt={upload.file.name}
                            className="w-full h-full object-cover"
                            fallback=""
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                          {getFileIcon(upload.type)}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium truncate">
                            {upload.file.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(upload.status)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeUpload(upload.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                          <Badge variant="outline" className="text-xs">
                            {upload.type}
                          </Badge>
                          <span>{formatFileSize(upload.file.size)}</span>
                        </div>
                        
                        {upload.status === 'uploading' && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Uploading...</span>
                              <span>{Math.round(upload.uploadProgress)}%</span>
                            </div>
                            <Progress value={upload.uploadProgress} className="h-1" />
                          </div>
                        )}
                        
                        {upload.status === 'error' && upload.error && (
                          <p className="text-sm text-red-600">{upload.error}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {uploads.length > 0 && (
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setUploads([])}
                >
                  Clear All
                </Button>
                <Button 
                  onClick={() => onFileUpload(uploads.filter(u => u.status === 'completed'))}
                  disabled={uploads.every(u => u.status !== 'completed')}
                >
                  Add to Message
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="links" className="space-y-4">
            {/* Link Input */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Paste link URL here..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      fetchLinkPreview(linkUrl);
                    }
                  }}
                />
                <Button 
                  onClick={() => fetchLinkPreview(linkUrl)}
                  disabled={!linkUrl.trim()}
                >
                  Preview
                </Button>
              </div>

              {/* Link Preview */}
              {linkPreview && (
                <Card className="p-4">
                  {linkPreview.loading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                      </div>
                    </div>
                  ) : linkPreview.error ? (
                    <div className="flex items-center space-x-3 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <div>
                        <p className="font-medium">Failed to load preview</p>
                        <p className="text-sm">{linkPreview.error}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        {linkPreview.image && (
                          <div className="w-16 h-16 rounded overflow-hidden bg-muted flex-shrink-0">
                            <ImageWithFallback
                              src={linkPreview.image}
                              alt=""
                              className="w-full h-full object-cover"
                              fallback=""
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {linkPreview.title || 'Web Page'}
                          </h4>
                          {linkPreview.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {linkPreview.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-2 mt-2">
                            {linkPreview.favicon && (
                              <img 
                                src={linkPreview.favicon} 
                                alt="" 
                                className="w-4 h-4"
                              />
                            )}
                            <span className="text-xs text-muted-foreground truncate">
                              {linkPreview.url}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigator.clipboard.writeText(linkPreview.url)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(linkPreview.url, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setLinkUrl('');
                            setLinkPreview(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={addLink}>
                          Add to Message
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Supported link types:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Web pages (automatic preview)</li>
                <li>GitHub repositories</li>
                <li>Social media posts</li>
                <li>Documentation links</li>
                <li>Video and media links</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}