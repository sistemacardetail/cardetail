import React from 'react';

export interface DialogComponentProps<P, R> {
  open: boolean;
  payload: P;
  onClose: (result: R) => Promise<void>;
}

export type DialogComponent<P, R> = React.ComponentType<DialogComponentProps<P, R>>;

export interface OpenDialogOptions<R> {
  onClose?: (result: R) => Promise<void>;
}

export type OpenDialog = <P, R>(
  Component: DialogComponent<P, R>,
  payload: P,
  options?: OpenDialogOptions<R>
) => Promise<R>;

interface DialogsContextValue {
  open: OpenDialog;
  close: <R>(dialog: Promise<R>, result: R) => Promise<R>;
}

const DialogsContext = React.createContext<DialogsContextValue | null>(null);

export function useDialogs(): DialogsContextValue {
  const context = React.useContext(DialogsContext);
  if (!context) {
    throw new Error('useDialogs must be used within DialogsProvider');
  }
  return context;
}

export default DialogsContext;
