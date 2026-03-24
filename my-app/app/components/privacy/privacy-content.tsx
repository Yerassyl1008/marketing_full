const sections = [
  "What is Lorem Ipsum?",
  "What is Lorem Ipsum?",
  "What is Lorem Ipsum?",
  "What is Lorem Ipsum?",
  "What is Lorem Ipsum?",
  "What is Lorem Ipsum?",
  "What is Lorem Ipsum?",
  "What is Lorem Ipsum?",
];

const bodyText =
  "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

export default function PrivacyContent() {
  return (
    <section className="mt-6 p-4 md:p-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-zinc-800 md:text-4xl">
        Lorem Ipsum
      </h1>

      <div className="space-y-6">
        {sections.map((title, index) => (
          <article key={`${title}-${index}`} className="border-l border-zinc-400 pl-3 md:pl-4">
            <h2 className="mb-2 text-xl font-semibold text-zinc-800 md:text-3xl">
              {title}
            </h2>
            <p className="text-sm leading-6 text-zinc-700 md:text-base md:leading-7">
              {bodyText}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
