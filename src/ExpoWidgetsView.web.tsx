import * as React from 'react';

import { ExpoWidgetsViewProps } from './ExpoWidgets.types';

export default function ExpoWidgetsView(props: ExpoWidgetsViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
