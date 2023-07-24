import ExpoWidgetsModule from './ExpoWidgetsModule';

export async function setValueAsync(value: string) {
  return await ExpoWidgetsModule.setValueAsync(value);
}