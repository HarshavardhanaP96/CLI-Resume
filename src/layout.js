import chalk from "chalk";
import boxen from "boxen";
import wrapAnsi from "wrap-ansi";
import stripAnsi from "strip-ansi";
import { contactInfo, leftColumn, rightColumn } from "./content.js";

const terminalWidth = Math.min(process.stdout.columns || 80, 120);
const columnGap = 4;
const boxPadding = 1;
const colWidth = Math.floor((terminalWidth - columnGap) / 2);

const wrapBoxContent = (lines, width) =>
  wrapAnsi(lines.join("\n"), width - 2 * boxPadding, { hard: true }).split(
    "\n"
  );

const formatSectionTitle = (emoji, title) => {
  const line = "─".repeat(title.length + 4);
  return chalk.bold.cyan(`${emoji} ${title.toUpperCase()}\n${line}`);
};

const formatSubTitle = (title, org, duration) =>
  `${chalk.bold.yellow(title)}\n${chalk.gray(org)} | ${chalk.dim(duration)}`;

const bullet = (text) => chalk.gray("  • ") + text;

const createBox = (emoji, title, lines) => {
  const sectionHeader = formatSectionTitle(emoji, title);
  const wrappedContent = wrapBoxContent([sectionHeader, ...lines], colWidth);
  return boxen(wrappedContent.join("\n"), {
    padding: boxPadding,
    width: colWidth,
    borderColor: "gray",
  });
};

const createHeader = () => {
  const { name, role, email, location, linkedin, github, website } =
    contactInfo;

  const headerLines = [
    chalk.bold.bgBlue.white(` ${name} — ${role} `),
    `${chalk.cyan("📧")} ${email}  ${chalk.cyan("📍")} ${location}`,
    `${chalk.green("🔗")} ${linkedin}  ${chalk.yellow(
      "💻"
    )} ${github}  ${chalk.blue("🌐")} ${website}`,
  ];

  return boxen(headerLines.join("\n"), {
    padding: { top: 1, bottom: 1, left: 2, right: 2 },
    margin: { top: 1, bottom: 1 },
    borderColor: "green",
    title: chalk.bold.yellow(" 🎯 RESUME "),
    titleAlignment: "center",
    width: terminalWidth - 4,
  });
};

const zipColumns = (leftBoxes, rightBoxes) => {
  const lines = [];

  for (let i = 0; i < Math.max(leftBoxes.length, rightBoxes.length); i++) {
    const left = (leftBoxes[i] || "").split("\n");
    const right = (rightBoxes[i] || "").split("\n");
    const maxLines = Math.max(left.length, right.length);

    for (let j = 0; j < maxLines; j++) {
      const leftLine = stripAnsi(left[j] || "").padEnd(colWidth);
      const rightLine = right[j] || "";
      lines.push(`${leftLine}${" ".repeat(columnGap)}${rightLine}`);
    }
    lines.push("");
  }

  return lines.join("\n");
};

export const renderResume = () => {
  const header = createHeader();

  const leftBoxes = Object.entries(leftColumn).map(([section, items]) =>
    createBox("📘", section, items.map(bullet))
  );

  const rightBoxes = Object.entries(rightColumn).map(([section, entries]) => {
    const formatted = entries.flatMap((entry) => {
      if (typeof entry === "string") return [bullet(entry)];
      const { title, org, duration, highlights = [] } = entry;
      return [
        formatSubTitle(title, org, duration),
        ...highlights.map(bullet),
        "",
      ];
    });
    return createBox("🛠️", section, formatted);
  });

  const twoCols = zipColumns(leftBoxes, rightBoxes);

  console.log(header);
  console.log(twoCols);
};
