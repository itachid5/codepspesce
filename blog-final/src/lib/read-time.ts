const WORDS_PER_MINUTE = 200;

export function stripContent(content: string) {
  return content
    .replace(/<[^>]*>/g, " ")
    .replace(/[`*_#>\-[\]()+.!]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function calculateReadTimeMinutes(content: string) {
  const words = stripContent(content).split(" ").filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
