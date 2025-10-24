import React from 'react';
import { Tooth } from './Tooth';
// FIX: Changed import to be a relative path.
import type { OdontogramState, ToothSurfaceName } from '../types';

interface OdontogramProps {
    odontogramState: OdontogramState;
    onToothClick: (activeTooth: { toothId: number, surface: ToothSurfaceName | 'whole' }) => void;
    activeToothInfo: { toothId: number; surface: ToothSurfaceName | 'whole' } | null;
    quadrants: {
        UPPER_RIGHT: number[];
        UPPER_LEFT: number[];
        LOWER_RIGHT: number[];
        LOWER_LEFT: number[];
    };
}

const Quadrant: React.FC<{
    toothIds: number[];
    odontogramState: OdontogramState;
    onToothClick: (activeTooth: { toothId: number, surface: ToothSurfaceName | 'whole' }) => void;
    activeToothInfo: { toothId: number; surface: ToothSurfaceName | 'whole' } | null;
    className?: string;
}> = ({ toothIds, odontogramState, onToothClick, activeToothInfo, className }) => (
    <div className={`flex gap-x-1 ${className}`}>
        {toothIds.map(toothId => (
            <Tooth
                key={toothId}
                toothId={toothId}
                toothState={odontogramState[toothId]}
                onToothClick={(surface) => onToothClick({ toothId, surface })}
                isActive={activeToothInfo?.toothId === toothId}
                activeSurface={activeToothInfo?.toothId === toothId ? activeToothInfo.surface : null}
            />
        ))}
    </div>
);


export const Odontogram: React.FC<OdontogramProps> = ({ odontogramState, onToothClick, activeToothInfo, quadrants }) => {
    return (
        <div className="flex flex-col items-center p-2">
            <div className="flex border-b-2 border-gray-300 dark:border-gray-600 w-full justify-center gap-y-2">
                <Quadrant toothIds={quadrants.UPPER_RIGHT.slice().reverse()} odontogramState={odontogramState} onToothClick={onToothClick} activeToothInfo={activeToothInfo} className="border-r-2 border-gray-300 dark:border-gray-600 pr-1" />
                <Quadrant toothIds={quadrants.UPPER_LEFT} odontogramState={odontogramState} onToothClick={onToothClick} activeToothInfo={activeToothInfo} className="pl-1" />
            </div>
            <div className="flex w-full justify-center pt-2 gap-y-2">
                <Quadrant toothIds={quadrants.LOWER_RIGHT.slice().reverse()} odontogramState={odontogramState} onToothClick={onToothClick} activeToothInfo={activeToothInfo} className="border-r-2 border-gray-300 dark:border-gray-600 pr-1" />
                <Quadrant toothIds={quadrants.LOWER_LEFT} odontogramState={odontogramState} onToothClick={onToothClick} activeToothInfo={activeToothInfo} className="pl-1" />
            </div>
        </div>
    );
};