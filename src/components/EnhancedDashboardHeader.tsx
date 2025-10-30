import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Menu, Lightbulb } from 'lucide-react';
import AdvancedSearchEngine from './AdvancedSearchEngine';
import AdvancedNotificationCenter from './AdvancedNotificationCenter';

interface EnhancedDashboardHeaderProps {
  currentView: string;
  unreadMessageCount: number;
  hasSeenOnboarding: boolean;
  onToggleMobileMenu: () => void;
  onSearchResultClick: (result: any) => void;
  onSaveSearch: (query: string, filters: any) => void;
  onShowOnboarding: () => void;
  onNotificationClick: (notification: any) => void;
  savedSearches: Array<{ query: string; filters: any; name: string }>;
}

const EnhancedDashboardHeader: React.FC<EnhancedDashboardHeaderProps> = ({
  currentView,
  unreadMessageCount,
  hasSeenOnboarding,
  onToggleMobileMenu,
  onSearchResultClick,
  onSaveSearch,
  onShowOnboarding,
  onNotificationClick,
  savedSearches,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6">
      <div className="flex items-center justify-between h-16">
        {/* Mobile menu button and title */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onToggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:block">
            <h1 className="text-xl font-semibold text-gray-900 capitalize">
              {currentView === 'project-details' ? 'Project Details' : currentView}
            </h1>
          </div>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-lg mx-4">
          <AdvancedSearchEngine
            onResultClick={onSearchResultClick}
            onSaveSearch={onSaveSearch}
            savedSearches={savedSearches}
          />
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Tutorial/Help Button */}
          {hasSeenOnboarding && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShowOnboarding}
                    className="hidden sm:flex"
                  >
                    <Lightbulb className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Show tutorial</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Advanced Notifications */}
          <AdvancedNotificationCenter
            userId="demo-user"
            onNotificationClick={onNotificationClick}
          />
        </div>
      </div>
    </header>
  );
};

export default EnhancedDashboardHeader;