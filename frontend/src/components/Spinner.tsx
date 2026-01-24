export const Spinner = ({ label }: { label?: string }) => (
  <div className='flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
    <span className='h-4 w-4 animate-spin rounded-full border-2 border-brand-primary border-t-transparent' />
    {label && <span>{label}</span>}
  </div>
);

export const FullPageSpinner = ({ label = 'Loading...' }: { label?: string }) => (
  <div className='flex min-h-[60vh] items-center justify-center'>
    <Spinner label={label} />
  </div>
);
