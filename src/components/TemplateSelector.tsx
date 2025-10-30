import React, { useState, useEffect } from 'react';
import { X, MessageSquare, TrendingUp, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../utils/supabase/client';
import { MessageTemplate } from '../types/messaging';
import TemplateEditor from './TemplateEditor';

interface TemplateSelectorProps {
  recipientData: {
    name: string;
    title: string;
    project?: string;
    company?: string;
  };
  onSelectTemplate: (content: string, templateId: string) => void;
  onCancel: () => void;
}

export default function TemplateSelector({ 
  recipientData, 
  onSelectTemplate, 
  onCancel 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) throw error;

      // Add default templates if none exist
      if (data.length === 0) {
        await createDefaultTemplates(user.id);
        loadTemplates(); // Reload after creating defaults
        return;
      }

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultTemplates = async (recruiterId: string) => {
    const defaultTemplates = [
      {
        recruiter_id: recruiterId,
        title: 'Initial Outreach',
        content: `Hi {{name}}! I came across your {{project}} project and was really impressed with {{impressive_aspect}}. I'm recruiting for a {{role}} position at {{company}} and think you'd be a great fit. Would you be interested in learning more?`,
        category: 'intro',
        variables: ['name', 'project', 'impressive_aspect', 'role', 'company'],
        usage_count: 0,
        response_count: 0
      },
      {
        recruiter_id: recruiterId,
        title: 'Interview Invitation',
        content: `Hi {{name}}, thanks for your interest in the {{role}} position! I'd love to set up a brief 30-minute call to discuss the opportunity in more detail. Are you available {{time_options}}?`,
        category: 'interview',
        variables: ['name', 'role', 'time_options'],
        usage_count: 0,
        response_count: 0
      },
      {
        recruiter_id: recruiterId,
        title: 'Follow-up Message',
        content: `Hi {{name}}, I wanted to follow up on our previous conversation about the {{role}} position. Do you have any questions about the opportunity? I'm happy to provide more details about the role or our company.`,
        category: 'follow_up',
        variables: ['name', 'role'],
        usage_count: 0,
        response_count: 0
      }
    ];

    await supabase.from('message_templates').insert(defaultTemplates);
  };

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
  };

  const handleTemplateUse = async (content: string, templateId: string) => {
    // Update usage count
    await supabase
      .from('message_templates')
      .update({ usage_count: templates.find(t => t.id === templateId)?.usage_count + 1 })
      .eq('id', templateId);

    onSelectTemplate(content, templateId);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'intro':
        return <MessageSquare className="h-4 w-4" />;
      case 'interview':
        return <Clock className="h-4 w-4" />;
      case 'follow_up':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getResponseRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredTemplates = currentCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === currentCategory);

  if (selectedTemplate) {
    return (
      <TemplateEditor
        template={selectedTemplate}
        recipientData={recipientData}
        onUse={handleTemplateUse}
        onBack={() => setSelectedTemplate(null)}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="bg-background border rounded-lg shadow-lg max-h-96 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-medium">Message Templates</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={currentCategory} onValueChange={setCurrentCategory} className="w-full">
        <TabsList className="w-full justify-start p-4 bg-transparent">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="intro">Intro</TabsTrigger>
          <TabsTrigger value="interview">Interview</TabsTrigger>
          <TabsTrigger value="follow_up">Follow-up</TabsTrigger>
        </TabsList>

        <TabsContent value={currentCategory} className="mt-0">
          <div className="max-h-64 overflow-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4>No templates found</h4>
                <p className="text-muted-foreground text-sm">
                  Create your first template to get started
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {filteredTemplates.map((template) => {
                  const responseRate = template.usage_count > 0 
                    ? Math.round((template.response_count / template.usage_count) * 100)
                    : 0;

                  return (
                    <Card
                      key={template.id}
                      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(template.category)}
                          <span className="font-medium">{template.title}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {template.content.length > 100 
                          ? template.content.substring(0, 100) + '...'
                          : template.content
                        }
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Used {template.usage_count} times</span>
                        {template.usage_count > 0 && (
                          <span className={getResponseRateColor(responseRate)}>
                            {responseRate}% response rate
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t bg-muted/20">
        <Button variant="outline" size="sm" className="w-full">
          + Create New Template
        </Button>
      </div>
    </div>
  );
}