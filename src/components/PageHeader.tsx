type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: Props) {
  return (
    <header className="px-5 pt-8 pb-5">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-1.5 font-serif text-2xl font-semibold leading-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </header>
  );
}
