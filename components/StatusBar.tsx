import React from 'react';
// FIX: Changed import to be a relative path.
import type { ToothSurfaceName } from '../types';

interface StatusBarProps {
    activeTooth: { toothId: number; surface: ToothSurfaceName | 'whole' } | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ activeTooth }) => {
    return (
        <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-4 p-2 rounded-b-lg text-sm text-gray-600 dark:text-gray-300 flex items-center justify-start">
            <div className="flex items-center gap-6">
                <span>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Diente:</span> {activeTooth ? activeTooth.toothId : 'Ninguno'}
                </span>
                <span>
                    <span className="font-semibold text-gray-500 dark:text-gray-400">Superficie:</span> {activeTooth ? activeTooth.surface : 'N/A'}
                </span>
            </div>
        </div>
    );
};
