export function ArticleBody({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  return (
    <div className="article-body mx-auto max-w-3xl">
      {blocks.map((block, index) => {
        if (block.startsWith("## ")) return <h2 key={index}>{block.replace(/^## /, "")}</h2>;
        if (block.startsWith("# ")) return <h1 key={index}>{block.replace(/^# /, "")}</h1>;
        return <p key={index}>{block}</p>;
      })}
    </div>
  );
}
