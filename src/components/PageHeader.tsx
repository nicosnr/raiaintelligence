type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <header className="px-5 pt-8 pb-5">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground not-italic">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1.5 font-serif text-4xl leading-[1] tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-sm leading-relaxed not-italic text-muted-foreground">
          {description}
        </p>
      )}
    </header>
  );
}
