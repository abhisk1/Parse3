const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");

async function getContent(src) {
  const doc = await pdfjs.getDocument(src).promise;
  const page = await doc.getPage(1);
  return await page.getTextContent();
}

async function pdfToJson(src, outputFile) {
  const content = await getContent(src);

  // Object to store the structured output
  let structuredOutput = {};
  let currentHeader = null;

  // Process each text item to group under headers
  content.items.forEach((item) => {
    const text = item.str.trim();

    if (!text) return; // Skip empty strings

    // Detect section headers (like "Bill To:")
    if (text.endsWith(":")) {
      currentHeader = text; // Set the current header
      structuredOutput[currentHeader] = ""; // Initialize the section
    } else if (currentHeader) {
      // Append the text to the current section
      structuredOutput[currentHeader] +=
        (structuredOutput[currentHeader] ? "\n" : "") + text;
    }
  });

  // Write the structured output to a JSON file
  fs.writeFileSync(
    outputFile,
    JSON.stringify(structuredOutput, null, 2),
    "utf8"
  );
  console.log(`Structured JSON data has been saved to ${outputFile}`);
}

// Call the function with the input file and output file paths
pdfToJson("./salesOrder.pdf", "./output1.json");
