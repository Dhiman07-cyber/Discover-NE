import fs from 'fs/promises';
import path from 'path';

// Helper functions for file operations
export async function readJsonFile(filename) {
  try {
    // Look for data files in server/data directory
    const filePath = path.join(process.cwd(), 'server', 'data', filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

export async function writeJsonFile(filename, data) {
  try {
    // Write data files to server/data directory
    const filePath = path.join(process.cwd(), 'server', 'data', filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// Initialize data files if they don't exist
export async function initializeDataFiles() {
  try {
    // Check if files exist, if not create them with empty arrays/objects
    const files = ['states.json', 'cities.json', 'feedback.json'];
    
    for (const file of files) {
      const filePath = path.join(process.cwd(), 'server', 'data', file);
      try {
        await fs.access(filePath);
      } catch {
        // File doesn't exist, create it
        const initialData = file === 'feedback.json' ? [] : [];
        await writeJsonFile(file, initialData);
        console.log(`Created ${file}`);
      }
    }
  } catch (error) {
    console.error('Error initializing data files:', error);
  }
}