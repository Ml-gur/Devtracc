import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  Upload, 
  X, 
  Eye, 
  Camera,
  FileText,
  Hash,
  Lightbulb,
  Target
} from 'lucide-react';
import { Post, PostAttachment } from '../types/social';
import { ImageWithFallback } from './figma/ImageWithFallback';
import MdEditor from 'react-markdown-editor-lite';
import { supabase } from '../utils/supabase/client';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';

interface CreatePostModalProps {
  userId: string;
  projectId?: string;
  taskId?: string;
  prefilledData?: {
    postType?: Post['postType'];
    content?: string;
    tags?: string[];
  };
  onSubmit: (postData: CreatePostFormData) => Promise<void>;
  onClose: () => void;
}

export interface CreatePostFormData {
  postType: Post['postType'];
  content: string;
  reflectionNotes: string;
  attachments: Omit<PostAttachment, 'id' | 'postId'>[];
  tags: string[];
}

const POST_TYPES = [
  {
    type: 'progress_update' as const,
    icon: <TrendingUp className="w-5 h-5" />,
    label: 'Progress Update',
    description: 'Share your current development progress',
    color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
    examples: [
      'Implemented user authentication system',
      'Built responsive navigation component',
      'Added dark mode support to the app'
    ]
  },
  {
    type: 'task_completed' as const,
    icon: <CheckCircle2 className="w-5 h-5" />,
    label: 'Task Completed',
    description: 'Celebrate completing a specific task',
    color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    examples: [
      'Fixed critical bug in payment flow',
      'Completed user registration feature',
      'Deployed app to production server'
    ]
  },
  {
    type: 'help_request' as const,
    icon: <HelpCircle className="w-5 h-5" />,
    label: 'Help Request',
    description: 'Ask the community for help or advice',
    color: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
    examples: [
      'Struggling with React state management',
      'Need advice on database schema design',
      'How to handle file uploads in Node.js?'
    ]
  }
];

const REFLECTION_PROMPTS: Record<Post['postType'], string[]> = {
  progress_update: [
    'What challenges did you overcome today?',
    'What new skills or concepts did you learn?',
    'How does this progress move your project forward?'
  ],
  task_completed: [
    'What was the most difficult part of this task?',
    'What would you do differently next time?',
    'What did you learn while completing this task?'
  ],
  help_request: [
    'What have you already tried to solve this?',
    'What specific outcome are you trying to achieve?',
    'What resources have you consulted so far?'
  ],
  project_showcase: [],
  milestone: [],
  completion: [],
  project_share: [],
  challenge: []
};

const mdParser = new MarkdownIt();

export default function CreatePostModal({ 
  userId, 
  projectId, 
  taskId,
  prefilledData,
  onSubmit, 
  onClose 
}: CreatePostModalProps) {
  const [formData, setFormData] = useState<CreatePostFormData>({
    postType: prefilledData?.postType || 'progress_update',
    content: prefilledData?.content || '',
    reflectionNotes: '',
    attachments: [],
    tags: prefilledData?.tags || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [newTag, setNewTag] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const selectedPostType = POST_TYPES.find(type => type.type === formData.postType);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.content.trim()) {
      newErrors.content = 'Post content is required';
    } else if (formData.content.length > 500) {
      newErrors.content = 'Content must be less than 500 characters';
    }

    if (!formData.reflectionNotes.trim()) {
      newErrors.reflectionNotes = 'Reflection notes are required';
    } else if (formData.reflectionNotes.length < 50) {
      newErrors.reflectionNotes = 'Reflection notes must be at least 50 characters';
    } else if (formData.reflectionNotes.length > 1000) {
      newErrors.reflectionNotes = 'Reflection notes must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setErrors({});

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const uploadedAttachments: Omit<PostAttachment, 'id' | 'postId'>[] = [];
      const totalSize = filesToUpload.reduce((acc, file) => acc + file.size, 0);
      let uploadedSize = 0;

      if (filesToUpload.length > 0) {
        setUploadProgress(0);
      }

      // 1. Upload files to Supabase Storage
      for (const file of filesToUpload) {
        const filePath = `${userId}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('post-attachments')
          .upload(filePath, file);
        const { data: uploadData, error: uploadError } = await supabase.storage.from('post-attachments').upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          // @ts-ignore - onUploadProgress is not in the type definition but exists in the underlying xhr implementation
          onUploadProgress: (progressEvent) => {
            const percentComplete = (uploadedSize + progressEvent.loaded) / totalSize;
            setUploadProgress(Math.min(percentComplete * 100, 100));
          },
        });

        if (uploadError) {
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }

        uploadedSize += file.size;
        setUploadProgress((uploadedSize / totalSize) * 100);

        const { data: urlData } = supabase.storage.from('post-attachments').getPublicUrl(filePath);
        
        uploadedAttachments.push({
          fileUrl: urlData.publicUrl,
          fileType: file.type.startsWith('image/') ? 'image' : 'video',
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        });
        if (urlData) {
          uploadedAttachments.push({
            fileUrl: urlData.publicUrl,
            fileType: file.type.startsWith('image/') ? 'image' : 'video',
            fileName: file.name,
            fileSize: file.size,
            uploadedAt: new Date().toISOString(),
          });
        } else {
          throw new Error(`Could not get public URL for ${file.name}`);
        }
      }

      // 2. Call onSubmit with the final data, including permanent URLs
      await onSubmit({ ...formData, attachments: uploadedAttachments });
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create post. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  const validateFile = (file: File): string | null => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (file.type.startsWith('image/') && !allowedImageTypes.includes(file.type)) {
      return 'Only JPEG, PNG, GIF, and WebP images are allowed';
    }

    if (file.type.startsWith('video/') && !allowedVideoTypes.includes(file.type)) {
      return 'Only MP4, WebM, and OGG videos are allowed';
    }

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      return 'Only image and video files are allowed';
    }

    return null;
  };

  const handleFileUpload = (files: FileList) => {
    setErrors(prev => ({ ...prev, files: undefined }));
    const maxFiles = 5;
    const currentCount = formData.attachments.length;

    if (currentCount >= maxFiles) {
      setErrors(prev => ({ ...prev, files: `Maximum ${maxFiles} files allowed` }));
      return;
    }

    const filesToProcess = Array.from(files).slice(0, maxFiles - currentCount);
    
    for (const file of filesToProcess) {
      const validationError = validateFile(file);
      if (validationError) {
        setErrors(prev => ({ ...prev, files: `${file.name}: ${validationError}` }));
        return; // Stop processing on the first error
      }
    }

    filesToProcess.forEach(file => {
      // Use createObjectURL for instant, lightweight previews
      const previewUrl = URL.createObjectURL(file);

      const fileType = file.type.startsWith('image/') ? 'image' : 'video';
      const newAttachment: Omit<PostAttachment, 'id' | 'postId'> = {
        fileUrl: previewUrl, // This is a temporary local URL
        fileType,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      };

      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, newAttachment]
      }));
      // Store the actual File object for later upload
      setFilesToUpload(prev => [...prev, file]);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const removeAttachment = (index: number) => {
    const attachmentToRemove = formData.attachments[index];
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(attachmentToRemove.fileUrl);

    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 8) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleInputChange = (field: keyof CreatePostFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getCharacterCount = (text: string, max: number) => {
    const color = text.length > max * 0.9 ? 'text-red-500' : 
                  text.length > max * 0.7 ? 'text-yellow-500' : 
                  'text-muted-foreground';
    return (
      <span className={`text-xs ${color}`}>
        {text.length}/{max}
      </span>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share Your Progress</DialogTitle>
          <DialogDescription>
            Share your development journey with the DevTrack Africa community
          </DialogDescription>
        </DialogHeader>

        <Tabs value={showPreview ? 'preview' : 'create'} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create" onClick={() => setShowPreview(false)}>
              Create Post
            </TabsTrigger>
            <TabsTrigger value="preview" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Post Type Selection */}
              <div className="space-y-3">
                <Label>Post Type *</Label>
                <div className="grid grid-cols-1 gap-3">
                  {POST_TYPES.map(type => (
                    <Card 
                      key={type.type}
                      className={`cursor-pointer transition-all border-2 ${
                        formData.postType === type.type 
                          ? 'ring-2 ring-primary ring-offset-2 border-primary' 
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleInputChange('postType', type.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${type.color}`}>
                            {type.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{type.label}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {type.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {type.examples.slice(0, 2).map((example, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {example}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  What did you accomplish? *
                </Label>
                <MdEditor
                  id="content"
                  style={{ height: '200px' }}
                  value={formData.content}
                  onChange={({ text }) => handleInputChange('content', text || '')}
                  renderHTML={(text) => mdParser.render(text || '')}
                  placeholder={`e.g., ${selectedPostType?.examples[0] || 'Share your progress...'} (Supports Markdown)`}
                  className={errors.content ? 'border-destructive' : ''}
                />
                <div className="flex justify-between items-center">
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content}</p>
                  )}
                  <div className="ml-auto">
                    {getCharacterCount(formData.content, 5000)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports Markdown formatting. Max 5000 characters.
                </p>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>Add Images & Videos (Optional)</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Drag & drop images or videos here</p>
                      <p className="text-sm text-muted-foreground">or click to select files</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = true;
                        input.accept = 'image/*,video/*';
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files) handleFileUpload(files);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>

                {/* File Upload Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Maximum 5 files, 10MB each</p>
                  <p>• Images: JPEG, PNG, GIF, WebP</p>
                  <p>• Videos: MP4, WebM, OGG</p>
                </div>

                {/* File Error */}
                {errors.files && (
                  <p className="text-sm text-destructive">{errors.files}</p>
                )}

                {/* Uploaded Images */}
                {formData.attachments.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="relative group">
                        <ImageWithFallback
                          src={attachment.fileUrl}
                          alt={attachment.fileName}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reflection Notes */}
              <div className="space-y-2">
                <Label htmlFor="reflectionNotes">
                  Reflection Notes *
                  <Badge variant="secondary" className="ml-2">
                    Learning Required
                  </Badge>
                </Label>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Reflection Prompts:</p>
                      <ul className="text-xs text-blue-700 mt-1 space-y-1">
                        {REFLECTION_PROMPTS[formData.postType].map((prompt, index) => (
                          <li key={index}>• {prompt}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <Textarea
                  id="reflectionNotes"
                  value={formData.reflectionNotes}
                  onChange={(e) => handleInputChange('reflectionNotes', e.target.value)}
                  placeholder="Share what you learned, challenges you faced, or insights you gained..."
                  rows={4}
                  className={errors.reflectionNotes ? 'border-destructive' : ''}
                />
                <div className="flex justify-between items-center">
                  {errors.reflectionNotes && (
                    <p className="text-sm text-destructive">{errors.reflectionNotes}</p>
                  )}
                  <div className="ml-auto">
                    {getCharacterCount(formData.reflectionNotes, 1000)}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 50 characters required to encourage thoughtful reflection
                </p>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="e.g., react, authentication"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
                    <Hash className="w-4 h-4" />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-destructive/20 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Add up to 8 tags to help others discover your post
                </p>
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress !== null && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading files...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.content.trim() || !formData.reflectionNotes.trim()}
                >
                  {isSubmitting ? 'Sharing...' : 'Share Progress'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${selectedPostType?.color || 'bg-gray-100'}`}>
                  {selectedPostType?.icon}
                </div>
                <h3 className="text-lg font-semibold">{selectedPostType?.label || 'Post'}</h3>
              </div>
              
              {/* Content Preview */}
              <div className="prose prose-sm max-w-none border rounded-lg p-4 bg-background">
                <div dangerouslySetInnerHTML={{ __html: mdParser.render(formData.content || '') }} />
              </div>

              {/* Attachments Preview */}
              {formData.attachments.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Attachments:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {formData.attachments.map((attachment, index) => (
                      <div key={index} className="relative">
                        {attachment.fileType === 'image' ? (
                          <ImageWithFallback
                            src={attachment.fileUrl}
                            alt={attachment.fileName}
                            className="w-full h-24 object-cover rounded-lg border"
                          />
                        ) : (
                          <video
                            src={attachment.fileUrl}
                            className="w-full h-24 object-cover rounded-lg border"
                            controls={false}
                          />
                        )}
                        <p className="text-xs text-muted-foreground mt-1 truncate">{attachment.fileName}</p>
                        <Badge variant="outline" className="absolute top-1 right-1 text-xs">
                          {attachment.fileType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflection Notes Preview */}
              {formData.reflectionNotes && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800">Reflection Notes</h4>
                  <p className="text-sm">{formData.reflectionNotes}</p>
                </div>
              )}

              {/* Tags Preview */}
              {formData.tags.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}