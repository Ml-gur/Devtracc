import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Save } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { MessageTemplate, TemplateVariables } from '../types/messaging';

interface TemplateEditorProps {
  template: MessageTemplate;
  recipientData: {
    name: string;
    title: string;
    project?: string;
    company?: string;
  };
  onUse: (content: string, templateId: string) => void;
  onBack: () => void;
  onCancel: () => void;
}

export default function TemplateEditor({ 
  template, 
  recipientData, 
  onUse, 
  onBack, 
  onCancel 
}: TemplateEditorProps) {
  const [variables, setVariables] = useState<TemplateVariables>({});
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    // Initialize variables with default values
    const initialVariables: TemplateVariables = {};
    
    template.variables.forEach(variable => {
      switch (variable) {
        case 'name':
          initialVariables[variable] = recipientData.name;
          break;
        case 'role':
        case 'title':
          initialVariables[variable] = recipientData.title || 'Developer';
          break;
        case 'project':
          initialVariables[variable] = recipientData.project || 'your recent project';
          break;
        case 'company':
          initialVariables[variable] = recipientData.company || 'our company';
          break;
        case 'impressive_aspect':
          initialVariables[variable] = 'the clean code structure and attention to detail';
          break;
        case 'time_options':
          initialVariables[variable] = 'this Tuesday or Wednesday afternoon';
          break;
        default:
          initialVariables[variable] = `[${variable}]`;
      }
    });
    
    setVariables(initialVariables);
  }, [template, recipientData]);

  useEffect(() => {
    // Update preview when variables change
    let content = template.content;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value);
    });
    
    setPreviewContent(content);
  }, [variables, template.content]);

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSend = () => {
    onUse(previewContent, template.id);
  };

  const getVariableLabel = (variable: string) => {
    switch (variable) {
      case 'name':
        return 'Recipient Name';
      case 'role':
        return 'Job Role';
      case 'title':
        return 'Current Title';
      case 'project':
        return 'Project Name';
      case 'company':
        return 'Company Name';
      case 'impressive_aspect':
        return 'What Impressed You';
      case 'time_options':
        return 'Available Times';
      default:
        return variable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getVariablePlaceholder = (variable: string) => {
    switch (variable) {
      case 'name':
        return 'John Doe';
      case 'role':
        return 'Senior Frontend Developer';
      case 'title':
        return 'Full Stack Developer';
      case 'project':
        return 'E-commerce Website';
      case 'company':
        return 'TechCorp Ltd';
      case 'impressive_aspect':
        return 'the responsive design and clean code';
      case 'time_options':
        return 'this week or next Monday';
      default:
        return `Enter ${variable}...`;
    }
  };

  return (
    <div className="bg-background border rounded-lg shadow-lg max-h-96 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium">Customize Template: {template.title}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          ×
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 max-h-80 overflow-auto">
        {/* Variables */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Variables:</h4>
          {template.variables.map((variable) => (
            <div key={variable}>
              <Label htmlFor={variable} className="text-xs">
                {getVariableLabel(variable)}
              </Label>
              <Input
                id={variable}
                value={variables[variable] || ''}
                onChange={(e) => handleVariableChange(variable, e.target.value)}
                placeholder={getVariablePlaceholder(variable)}
                className="mt-1"
                size="sm"
              />
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Preview:</h4>
          <Card className="p-3">
            <Textarea
              value={previewContent}
              readOnly
              className="min-h-32 resize-none border-0 p-0 bg-transparent"
              placeholder="Preview will appear here..."
            />
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t bg-muted/20">
        <div className="text-xs text-muted-foreground">
          Template used {template.usage_count} times • 
          {template.usage_count > 0 && (
            <span className="ml-1">
              {Math.round((template.response_count / template.usage_count) * 100)}% response rate
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button 
            onClick={handleSend}
            size="sm"
            disabled={!previewContent.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}