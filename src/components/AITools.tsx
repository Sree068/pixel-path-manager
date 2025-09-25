import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  Wand2, 
  Image, 
  Users, 
  Sparkles,
  Eye,
  Settings,
  Play,
  Pause,
  Check,
  AlertCircle,
  FileImage,
  Scissors,
  Palette,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AITools = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingJobs, setProcessingJobs] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('background-removal');
  const { toast } = useToast();

  const aiTools = [
    {
      id: 'background-removal',
      name: 'Background Removal',
      description: 'Remove backgrounds from portraits and product photos instantly',
      icon: Scissors,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      credits: 1
    },
    {
      id: 'face-detection',
      name: 'Face Detection & Sorting',
      description: 'Automatically detect and group photos by people',
      icon: Users,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      credits: 2
    },
    {
      id: 'enhancement',
      name: 'Photo Enhancement',
      description: 'AI-powered color correction, sharpening, and upscaling',
      icon: Sparkles,
      color: 'text-success',
      bgColor: 'bg-success/10',
      credits: 3
    },
    {
      id: 'style-transfer',
      name: 'Style Transfer',
      description: 'Apply artistic styles and filters to your photos',
      icon: Palette,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      credits: 2
    }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
    toast({
      title: "Files Uploaded",
      description: `${acceptedFiles.length} file(s) added for processing`,
    });
  }, [toast]);

  const simulateProcessing = (tool: string, files: File[]) => {
    const jobId = Date.now().toString();
    
    const job = {
      id: jobId,
      tool: tool,
      files: files,
      progress: 0,
      status: 'processing',
      startTime: new Date(),
      estimatedTime: files.length * 3 // 3 seconds per file
    };

    setProcessingJobs(prev => [...prev, job]);

    // Simulate processing progress
    const interval = setInterval(() => {
      setProcessingJobs(prev => prev.map(j => {
        if (j.id === jobId) {
          const newProgress = Math.min(j.progress + Math.random() * 20, 100);
          return {
            ...j,
            progress: newProgress,
            status: newProgress >= 100 ? 'completed' : 'processing'
          };
        }
        return j;
      }));
    }, 500);

    // Complete the job after estimated time
    setTimeout(() => {
      clearInterval(interval);
      setProcessingJobs(prev => prev.map(j => {
        if (j.id === jobId) {
          return { ...j, progress: 100, status: 'completed' };
        }
        return j;
      }));
      
      toast({
        title: "Processing Complete",
        description: `${tool} completed for ${files.length} file(s)`,
      });
    }, job.estimatedTime * 1000);
  };

  const processFiles = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload some images first",
        variant: "destructive"
      });
      return;
    }

    simulateProcessing(selectedTool, uploadedFiles);
    setUploadedFiles([]);
  };

  const downloadResults = (jobId: string) => {
    // In a real application, this would download the processed files
    toast({
      title: "Download Started",
      description: "Processed files are being downloaded",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      onDrop(files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Play className="w-4 h-4 text-primary" />;
      case 'completed': return <Check className="w-4 h-4 text-success" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return <Pause className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-success/10 text-success border-success/20';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Photo Tools</h1>
          <p className="text-muted-foreground">Enhance your photos with AI-powered processing tools</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="w-4 h-4 mr-1" />
            25 AI Credits Available
          </Badge>
        </div>
      </div>

      {/* Tool Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          const isSelected = selectedTool === tool.id;
          
          return (
            <Card 
              key={tool.id} 
              className={`cursor-pointer transition-all card-hover ${
                isSelected ? 'ring-2 ring-primary shadow-premium' : ''
              }`}
              onClick={() => setSelectedTool(tool.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${tool.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${tool.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{tool.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {tool.credits} credit{tool.credits !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tool.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Drop files here or click to browse</h3>
                <p className="text-sm text-muted-foreground">
                  Support for JPG, PNG, WEBP files up to 10MB each
                </p>
              </label>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent rounded-md">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm truncate">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFile(index)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Process Button */}
            <Button 
              onClick={processFiles} 
              className="w-full gradient-primary text-white"
              disabled={uploadedFiles.length === 0}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Process with {aiTools.find(t => t.id === selectedTool)?.name}
            </Button>
          </CardContent>
        </Card>

        {/* Processing Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Processing Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Wand2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No processing jobs yet</p>
                  <p className="text-sm">Upload some images and start processing</p>
                </div>
              )}

              {processingJobs.map((job) => (
                <div key={job.id} className="p-4 border border-border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <h4 className="font-medium">
                        {aiTools.find(t => t.id === job.tool)?.name}
                      </h4>
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {job.files.length} file{job.files.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {job.status === 'processing' && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Processing...</span>
                        <span>{Math.round(job.progress)}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>
                  )}

                  {job.status === 'completed' && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => downloadResults(job.id)}
                        className="gradient-success text-white"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download Results
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tool Details */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {aiTools.find(t => t.id === selectedTool) && (
              <>
                {React.createElement(aiTools.find(t => t.id === selectedTool)!.icon, {
                  className: "w-5 h-5"
                })}
                {aiTools.find(t => t.id === selectedTool)?.name}
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedTool === 'background-removal' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Automatically remove backgrounds from your photos using advanced AI technology. 
                Perfect for portraits, product photos, and creating transparent images.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">✨ High Accuracy</h4>
                  <p className="text-muted-foreground">99% accurate edge detection</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">⚡ Fast Processing</h4>
                  <p className="text-muted-foreground">2-3 seconds per image</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">📱 Multiple Formats</h4>
                  <p className="text-muted-foreground">PNG, JPG, WEBP support</p>
                </div>
              </div>
            </div>
          )}

          {selectedTool === 'face-detection' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Automatically detect faces in your photos and organize them by person. 
                Great for sorting wedding photos and event galleries.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">👥 Multi-Face Detection</h4>
                  <p className="text-muted-foreground">Detect multiple faces per image</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">🏷️ Auto-Grouping</h4>
                  <p className="text-muted-foreground">Group by similar faces</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">📋 Custom Labels</h4>
                  <p className="text-muted-foreground">Add names and organize</p>
                </div>
              </div>
            </div>
          )}

          {selectedTool === 'enhancement' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Enhance your photos with AI-powered color correction, sharpening, and upscaling. 
                Automatically improve lighting, contrast, and overall image quality.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">🎨 Color Correction</h4>
                  <p className="text-muted-foreground">Auto-balance colors and exposure</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">🔍 Super Resolution</h4>
                  <p className="text-muted-foreground">Upscale up to 4x quality</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">✨ Noise Reduction</h4>
                  <p className="text-muted-foreground">Remove grain and artifacts</p>
                </div>
              </div>
            </div>
          )}

          {selectedTool === 'style-transfer' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Apply artistic styles and creative filters to your photos. 
                Transform your images with various artistic effects and professional-grade filters.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">🎭 Artistic Styles</h4>
                  <p className="text-muted-foreground">Van Gogh, Picasso, and more</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">📸 Photo Filters</h4>
                  <p className="text-muted-foreground">Vintage, modern, cinematic</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">⚙️ Custom Intensity</h4>
                  <p className="text-muted-foreground">Adjust effect strength</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AITools;