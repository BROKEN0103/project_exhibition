const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:\\project\\SIC MUNDUS\\frontend\\app');
const replacement = `let baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com";
        if (typeof window !== "undefined" && window.location.hostname !== "localhost" && baseUrl.includes("localhost")) {
          baseUrl = "https://project-exhibition.onrender.com";
        }`;

let totalFixed = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  // Replace empty fallback
  const search1 = 'const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""';
  if (content.includes(search1)) {
    content = content.split(search1).join(replacement);
    changed = true;
  }
  
  // Replace render fallback
  const search2 = 'const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://project-exhibition.onrender.com"';
  if (content.includes(search2)) {
    content = content.split(search2).join(replacement);
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
    totalFixed++;
  }
});

console.log('Total files fixed:', totalFixed);
