import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to ExpoWidgets.web.ts
// and on native platforms to ExpoWidgets.ts
import ExpoWidgetsModule from './ExpoWidgetsModule';
import ExpoWidgetsView from './ExpoWidgetsView';
import { ChangeEventPayload, ExpoWidgetsViewProps } from './ExpoWidgets.types';

// Get the native constant value.
export const PI = ExpoWidgetsModule.PI;

export function hello(): string {
  return ExpoWidgetsModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoWidgetsModule.setValueAsync(value);
}

const emitter = new EventEmitter(ExpoWidgetsModule ?? NativeModulesProxy.ExpoWidgets);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { ExpoWidgetsView, ExpoWidgetsViewProps, ChangeEventPayload };
