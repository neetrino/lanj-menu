type Props = {
  message?: string;
};

export function EmptyState({ message = 'No items available' }: Props) {
  return (
    <div className="flex items-center justify-center py-10 px-4">
      <p className="text-sm text-center text-text-muted">{message}</p>
    </div>
  );
}
