export default function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-6 text-sm text-destructive">
      {message}
    </div>
  );
}
