import React from "react";

interface Props {
  text: string;
}

const FormattedText = ({ text }: Props) => {
  const urlRegex =
    /(https?:\/\/|www\.)[^\s<>[\]{}|\\^]+?(?=[.,;:!?)]*(?:\s|$))/gi;

  return text.split("\n").map((line, index) => {
    const parts = [];
    let lastIndex = 0;
    let match;

    urlRegex.lastIndex = 0;

    while ((match = urlRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: line.slice(lastIndex, match.index),
          key: `text-${lastIndex}`,
        });
      }

      const url = match[0];
      const href = url.startsWith("http") ? url : `http://${url}`;
      parts.push({
        type: "url",
        content: url,
        href,
        key: `url-${match.index}`,
      });

      lastIndex = match.index + url.length;

      const punctuation = line.slice(lastIndex).match(/^[.,;:!?)]+/);
      if (punctuation) {
        parts.push({
          type: "text",
          content: punctuation[0],
          key: `punct-${lastIndex}`,
        });
        lastIndex += punctuation[0].length;
      }
    }

    if (lastIndex < line.length) {
      parts.push({
        type: "text",
        content: line.slice(lastIndex),
        key: `text-${lastIndex}`,
      });
    }

    return (
      <React.Fragment key={index}>
        {parts.map((part) =>
          part.type === "url" ? (
            <a
              key={part.key}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--primary-color)" }}
            >
              {part.content}
            </a>
          ) : (
            <span key={part.key}>{part.content}</span>
          )
        )}
        <br />
      </React.Fragment>
    );
  });
};

export default FormattedText;
