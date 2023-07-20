import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { ExpoWidgetsViewProps } from './ExpoWidgets.types';

const NativeView: React.ComponentType<ExpoWidgetsViewProps> =
  requireNativeViewManager('ExpoWidgets');

export default function ExpoWidgetsView(props: ExpoWidgetsViewProps) {
  return <NativeView {...props} />;
}
