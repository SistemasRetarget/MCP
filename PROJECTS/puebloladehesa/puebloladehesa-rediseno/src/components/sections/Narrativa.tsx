type Props = {
  title: string;
  paragraphs: string[];
};

export default function Narrativa({ title, paragraphs }: Props) {
  return (
    <section className="py-section px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-display-md mb-8">{title}</h2>
        <div className="space-y-4 text-lg leading-relaxed text-brand-ink/80">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
