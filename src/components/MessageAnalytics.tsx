import React, { useState, useEffect } from 'react';
import { TrendingUp, MessageCircle, Calendar, Users, Download, BarChart3 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { supabase } from '../utils/supabase/client';
import { MessageAnalytics as AnalyticsType } from '../types/messaging';

interface MessageAnalyticsProps {
  currentUserId: string;
  onBack: () => void;
}

export default function MessageAnalytics({ currentUserId, onBack }: MessageAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadAnalytics();
  }, [currentUserId, timeframe]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on timeframe
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeframe) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      // Get total messages sent
      const { data: sentMessages, error: sentError } = await supabase
        .from('messages')
        .select('id, template_id, created_at')
        .eq('sender_id', currentUserId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (sentError) throw sentError;

      // Get conversations with responses
      const conversationIds = [...new Set(sentMessages?.map(m => m.conversation_id) || [])];
      const { data: responses } = await supabase
        .from('messages')
        .select('conversation_id, created_at')
        .neq('sender_id', currentUserId)
        .in('conversation_id', conversationIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Get template performance
      const { data: templates } = await supabase
        .from('message_templates')
        .select('*')
        .eq('recruiter_id', currentUserId);

      // Calculate metrics
      const totalSent = sentMessages?.length || 0;
      const totalResponses = responses?.length || 0;
      const responseRate = totalSent > 0 ? (totalResponses / totalSent) * 100 : 0;

      // Mock additional data for demo (in real implementation, this would come from additional tables)
      const mockAnalytics: AnalyticsType = {
        total_sent: totalSent,
        total_responses: totalResponses,
        response_rate: responseRate,
        interviews_scheduled: Math.floor(totalResponses * 0.4), // Mock: 40% of responses lead to interviews
        successful_hires: Math.floor(totalResponses * 0.08), // Mock: 8% conversion rate
        template_performance: (templates || []).map(template => ({
          template_id: template.id,
          template_title: template.title,
          usage_count: template.usage_count,
          response_rate: template.usage_count > 0 ? (template.response_count / template.usage_count) * 100 : 0
        })),
        optimal_sending_times: [
          { day: 'Tuesday', hour: 10, response_rate: 78, avg_response_time: 2.5 },
          { day: 'Wednesday', hour: 14, response_rate: 71, avg_response_time: 3.1 },
          { day: 'Thursday', hour: 11, response_rate: 68, avg_response_time: 4.2 },
          { day: 'Monday', hour: 9, response_rate: 62, avg_response_time: 5.8 },
          { day: 'Friday', hour: 15, response_rate: 45, avg_response_time: 8.9 }
        ],
        avg_response_time: 4.2
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatTimeframe = (timeframe: string) => {
    switch (timeframe) {
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'Last 3 Months';
      default: return 'This Month';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ←
            </Button>
            <BarChart3 className="h-5 w-5" />
            <h1>Message Analytics</h1>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              ←
            </Button>
            <BarChart3 className="h-5 w-5" />
            <h1>Message Analytics</h1>
          </div>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3>No analytics data yet</h3>
            <p className="text-muted-foreground">
              Start sending messages to see your performance metrics
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ←
          </Button>
          <BarChart3 className="h-5 w-5" />
          <h1>Message Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
            <TabsList>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="quarter">Quarter</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Messages Sent</p>
                <p className="text-2xl font-medium">{analytics.total_sent}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Response Rate</p>
                <p className={`text-2xl font-medium ${getPerformanceColor(analytics.response_rate)}`}>
                  {analytics.response_rate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Interviews</p>
                <p className="text-2xl font-medium">{analytics.interviews_scheduled}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Successful Hires</p>
                <p className="text-2xl font-medium">{analytics.successful_hires}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Template Performance */}
          <Card className="p-6">
            <h3 className="font-medium mb-4">🏆 Template Performance</h3>
            <div className="space-y-4">
              {analytics.template_performance
                .sort((a, b) => b.response_rate - a.response_rate)
                .slice(0, 5)
                .map((template, index) => (
                  <div key={template.template_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">
                          {index + 1}. {template.template_title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {template.response_rate.toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={template.response_rate} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Used {template.usage_count} times
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>

          {/* Optimal Sending Times */}
          <Card className="p-6">
            <h3 className="font-medium mb-4">📅 Best Sending Times</h3>
            <div className="space-y-3">
              {analytics.optimal_sending_times
                .sort((a, b) => b.response_rate - a.response_rate)
                .map((time, index) => (
                  <div key={`${time.day}-${time.hour}`} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">
                        {time.day} {time.hour}:00 {time.hour < 12 ? 'AM' : 'PM'}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        Avg response: {time.avg_response_time}h
                      </p>
                    </div>
                    <Badge 
                      variant={index === 0 ? 'default' : 'secondary'}
                      className={index === 0 ? 'bg-green-500' : ''}
                    >
                      {time.response_rate}%
                    </Badge>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {/* Insights */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">💡 Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">📈 Performance Insights</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Your response rate is {analytics.response_rate > 60 ? 'excellent' : analytics.response_rate > 40 ? 'good' : 'needs improvement'} at {analytics.response_rate.toFixed(1)}%</li>
                <li>• Average response time: {analytics.avg_response_time} hours</li>
                <li>• Best template: {analytics.template_performance[0]?.template_title}</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">🎯 Recommendations</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Send messages on Tuesdays at 10 AM for best results</li>
                <li>• Avoid Friday evenings and weekends</li>
                <li>• Use your top-performing templates more often</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}