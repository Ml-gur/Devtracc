import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Copy, User, Mail, Lock, Eye, EyeOff, ChevronDown, TestTube } from 'lucide-react';
import { DEMO_ACCOUNTS, DemoAccountManager } from '../utils/demo-accounts';
import { hasSupabaseConfig } from '../utils/supabase/client';

interface AuthDebugPanelProps {
  onDemoAccountSelect?: (email: string, password: string) => void;
  compact?: boolean;
}

export default function AuthDebugPanel({ onDemoAccountSelect, compact = false }: AuthDebugPanelProps) {
  const [showPasswords, setShowPasswords] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDemoAccountClick = (account: typeof DEMO_ACCOUNTS[0]) => {
    if (onDemoAccountSelect) {
      onDemoAccountSelect(account.email, account.password);
    }
  };

  if (!hasSupabaseConfig()) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <TestTube className="w-5 h-5" />
            <span>Authentication Debug</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-yellow-700 text-sm">
            Supabase is not configured. Please check your Supabase configuration in client.ts
          </p>
          <ul className="mt-2 text-xs font-mono text-yellow-600 space-y-1">
            <li>• VITE_SUPABASE_URL</li>
            <li>• VITE_SUPABASE_ANON_KEY</li>
          </ul>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-between">
            <div className="flex items-center space-x-2">
              <TestTube className="w-4 h-4" />
              <span>Demo Accounts</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-2 space-y-2">
            {DEMO_ACCOUNTS.map((account, index) => (
              <div key={index} className="p-2 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">{account.name}</div>
                    <div className="text-xs text-muted-foreground">{account.email}</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDemoAccountClick(account)}
                  >
                    Use
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-blue-800">
          <div className="flex items-center space-x-2">
            <TestTube className="w-5 h-5" />
            <span>Demo Accounts Available</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPasswords(!showPasswords)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-blue-700 text-sm">
          Use these pre-configured accounts to test the application:
        </p>
        
        {DEMO_ACCOUNTS.map((account, index) => (
          <div key={index} className="border border-blue-200 rounded-lg p-3 bg-white">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{account.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {account.role}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3 h-3 text-blue-500" />
                    <span className="font-mono text-blue-700">{account.email}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account.email, `email-${index}`)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {copied === `email-${index}` && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3 h-3 text-blue-500" />
                    <span className="font-mono text-blue-700">
                      {showPasswords ? account.password : '••••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(account.password, `password-${index}`)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    {copied === `password-${index}` && (
                      <span className="text-xs text-green-600">Copied!</span>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-blue-600">{account.description}</p>
              </div>
              
              {onDemoAccountSelect && (
                <Button
                  size="sm"
                  onClick={() => handleDemoAccountClick(account)}
                  className="ml-3"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        ))}
        
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          <strong>Note:</strong> These demo accounts are automatically created when needed. 
          If login fails, the system will attempt to create the account first.
        </div>
      </CardContent>
    </Card>
  );
}