import React, { useState } from 'react';
import { MessageCircle, BarChart3, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import MessagesHub from './MessagesHub';
import MessageAnalytics from './MessageAnalytics';
import NotificationCenter from './NotificationCenter';

interface MessagingInterfaceProps {
  currentUserId: string;
  userType: 'developer' | 'recruiter';
  onBack: () => void;
}

export default function MessagingInterface({ 
  currentUserId, 
  userType, 
  onBack 
}: MessagingInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'messages' | 'analytics'>('messages');

  const handleNotificationClick = (notification: any) => {
    // Navigate to relevant conversation if it's a message notification
    if (notification.type.includes('message') && notification.related_data?.conversation_id) {
      setActiveTab('messages');
      // In a real implementation, you'd pass the conversation ID to MessagesHub
      // to automatically open the conversation
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back to Dashboard
          </Button>
          
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <h1>Messaging</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <NotificationCenter 
            currentUserId={currentUserId}
            onNotificationClick={handleNotificationClick}
          />
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList>
              <TabsTrigger value="messages" className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Messages</span>
              </TabsTrigger>
              {userType === 'recruiter' && (
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsContent value="messages" className="h-full m-0">
            <MessagesHub
              currentUserId={currentUserId}
              userType={userType}
              onBack={onBack}
            />
          </TabsContent>
          
          {userType === 'recruiter' && (
            <TabsContent value="analytics" className="h-full m-0">
              <MessageAnalytics
                currentUserId={currentUserId}
                onBack={() => setActiveTab('messages')}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}