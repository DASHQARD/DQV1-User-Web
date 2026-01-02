import fs from 'fs'

const iconsDirectory = './src/assets/svgs'
const outputFile = './src/types/icon-names.ts'

// Function to convert kebab-case to PascalCase
const kebabToPascalCase = (str) =>
  str
    .replace(/-./g, (match) => match[1].toUpperCase())
    .replace(/^[a-z]/, (match) => match.toUpperCase())

// Reading the icons directory
fs.readdir(iconsDirectory, (err, files) => {
  if (err) {
    console.error('Error reading the icons directory:', err)
    return
  }

  const iconTypes = files
    .filter((file) => file.endsWith('.svg')) // Filter only .svg files
    .map((file) => file.replace(/\.svg$/, '')) // Remove the .svg extension
    .map(kebabToPascalCase) // Convert file names to PascalCase

  // Create content for the types file
  const content = `export type IconNames = ${iconTypes.map((type) => `'${type}'`).join(' | ')};\n`

  // Write to the types file
  fs.writeFile(outputFile, content, (err) => {
    if (err) {
      console.error('Error writing to the types file:', err)
      return
    }
    console.log('Icon names type file updated successfully.')
  })
})
