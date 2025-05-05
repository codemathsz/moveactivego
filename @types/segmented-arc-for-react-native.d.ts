declare module '@shipt/segmented-arc-for-react-native' {
    import React from 'react';
    import { ViewProps } from 'react-native';
  
    export interface Segment {
      filledColor: string;
      emptyColor: string;
    }
  
    export interface SegmentedArcProps extends ViewProps {
      segments: Segment[];
      fillValue: number;
      isAnimated?: boolean;
      animationDelay?: number;
      children?: React.ReactNode;
    }
  
    export const SegmentedArc: React.FC<SegmentedArcProps>;
}