export function stringSplitter(input: string): string[] {
  const messages: string[] = [];

  let inObject = false;
  let startIndex = -1;
  let depth = -1;

  const WHITESPACE_TO_IGNORE = ['\t', ' ', '\n', '\r'];

  for (let i = 0; i < input.length; i += 1) {
    if (inObject === false && WHITESPACE_TO_IGNORE.indexOf(input[i]) > -1) {
      // Do nothing
    } else if (inObject === false && input[i] === '{') {
      inObject = true;
      startIndex = i;
      depth = 1;
    } else if (inObject === true && input[i] === '{') {
      depth += 1;
    } else if (inObject === true && input[i] === '}') {
      if (depth > 1) {
        depth -= 1;
      } else if (depth === 1) {
        messages.push(input.substring(startIndex, i + 1));
        inObject = false;
        depth = -1;
        startIndex = i;
      }
    }
  }

  return messages;
}
