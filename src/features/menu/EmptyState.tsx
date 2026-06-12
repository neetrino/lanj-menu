type Props = {
  message?: string;
};

export function EmptyState({ message = 'No items available' }: Props) {
  return (
    <div className="flex items-center justify-center py-10 px-4">
      <p className="text-[#7a5030]/60 text-sm text-center">{message}</p>
    </div>
  );
}
