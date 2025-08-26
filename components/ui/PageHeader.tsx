

import React, { Children, isValidElement } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';
import Button from './Button';
import { UserIcon } from './Icons';

interface PageHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
  mobileActions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  mobileActions,
}) => {
  // This logic correctly extracts the buttons from the wrapper div they are passed in.
  const actionButtons = Children.map(actions, child => {
    if (isValidElement<{ children?: React.ReactNode }>(child) && child.props.children) {
      return child.props.children;
    }
    return child;
  });

  return (
    <GlassCard
        transparencyLevel="high"
        className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
        <Button 
            as={Link} 
            to="/account" 
            variant="ghost" 
            className="!absolute top-2 right-2 !p-2 xl:hidden"
            aria-label="Account"
            title="Account"
        >
            <UserIcon className="text-2xl text-light-text-secondary dark:text-dark-text-secondary" />
        </Button>
        <div className="flex-grow pr-10">
            <h1 className="text-lg sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {title}
            </h1>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5 font-light max-w-full sm:max-w-md md:max-w-lg">
                {description}
            </p>
        </div>
        
        {/* Desktop actions container */}
        <div className="hidden xl:flex items-center gap-3 flex-shrink-0 mt-3 sm:mt-0">
             {actionButtons}
        </div>

        {/* Mobile actions container */}
        {mobileActions && (
            <div className="xl:hidden flex sm:justify-end mt-3 w-full">
                {mobileActions}
            </div>
        )}
    </GlassCard>
  );
};

export default PageHeader;