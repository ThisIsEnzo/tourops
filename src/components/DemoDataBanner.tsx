/** Persistent, unmissable label: this is a concept demo, not live software. */
export function DemoDataBanner({ text }: { text: string }) {
  return (
    <p className="demo-banner" role="note">
      <strong>Concept demo · synthetic data</strong>
      <span>{text}</span>
    </p>
  );
}
