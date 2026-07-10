const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-widgets',
  'ios',
  'Widgets',
  'RedBoxView.swift'
);

const before = `    if #available(iOS 17.0, *), kind == .widget {
      ZStack { content }.containerRelativeFrame([.horizontal, .vertical])
    } else {
      ZStack { content }.frame(maxWidth: .infinity)
    }`;

const after = `    if #available(iOS 17.0, *), kind == .widget {
      ZStack { content }
        .containerRelativeFrame([.horizontal, .vertical])
        .containerBackground(Color.red, for: .widget)
    } else {
      ZStack { content }.frame(maxWidth: .infinity)
    }`;

if (!fs.existsSync(targetPath)) {
  process.exit(0);
}

const source = fs.readFileSync(targetPath, 'utf8');

if (source.includes(".containerBackground(Color.red, for: .widget)")) {
  process.exit(0);
}

if (!source.includes(before)) {
  console.warn('[postinstall] expo-widgets RedBoxView.swift did not match expected source; patch skipped.');
  process.exit(0);
}

fs.writeFileSync(targetPath, source.replace(before, after));
console.log('[postinstall] Patched expo-widgets RedBoxView.swift for widget containerBackground fallback.');
