
import React, { useRef, useEffect, useState } from 'react';
import { ActiveTab } from '../types';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const tabs: { id: ActiveTab, label: string }[] = [
  { id: 'visualizations', label: 'Visualizations' },
  { id: 'settings', label: 'Settings' },
  { id: 'colors', label: 'Colors' },
  { id: 'comments', label: 'Comments' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'about', label: 'About' },
];

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const activeTabIndex = tabs.findIndex(t => t.id === activeTab);
    const activeTabElement = tabRefs.current[activeTabIndex];
    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeTab]);

  return (
    <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
      <nav className="relative flex space-x-2 sm:space-x-6 overflow-x-auto pb-px no-scrollbar w-full" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[index] = el; }}
            onClick={() => onTabChange(tab.id)}
            className={`px-2 py-3 font-semibold text-sm transition-all duration-200 ease-in-out whitespace-nowrap relative z-10 outline-none flex-shrink-0
              ${activeTab === tab.id
                ? 'text-sky-600 dark:text-sky-400'
                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {tab.label}
          </button>
        ))}
        {/* Animated Indicator moved inside nav to prevent overflow and sync with scroll */}
        <div
          className="absolute bottom-0 h-[3px] bg-sky-500 dark:bg-sky-400 rounded-t-sm transition-all duration-300 ease-out z-0"
          style={indicatorStyle}
        />
      </nav>
    </div>
  );
};

export default TabNavigation;