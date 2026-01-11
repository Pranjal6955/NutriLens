'use client';

import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '@/lib/utils';

const PanelGroup = ResizablePrimitive.Panel; // or another valid component
const Panel = ResizablePrimitive.Panel;
const PanelResizeHandle = ResizablePrimitive.Panel;

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="resizable-panel-group"
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="resizable-panel" className={cn('', className)} {...props} />
  );
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  withHandle?: boolean;
}) {
  return (
    <div
      data-slot="resizable-handle"
      className={cn(
        'bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90',
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-sm border">
          <svg
            className="size-2.5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="9" cy="12" r="1" />
            <circle cx="15" cy="12" r="1" />
          </svg>
        </div>
      )}
    </div>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
