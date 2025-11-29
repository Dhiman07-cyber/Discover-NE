import { readJsonFile, writeJsonFile } from '../../utils/fileHelper';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Parse form data
      const form = formidable({});
      form.uploadDir = path.join(process.cwd(), 'public/uploads');
      form.keepExtensions = true;
      
      // Ensure upload directory exists
      try {
        await fs.mkdir(form.uploadDir, { recursive: true });
      } catch (error) {
        console.error('Error creating upload directory:', error);
      }
      
      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(500).json({ error: 'Upload failed' });
        }
        
        const citySlug = Array.isArray(fields.citySlug) ? fields.citySlug[0] : fields.citySlug;
        const caption = Array.isArray(fields.caption) ? fields.caption[0] : fields.caption || '';
        const file = Array.isArray(files.photo) ? files.photo[0] : files.photo;
        
        if (!file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Validate file type - only allow jpg and png
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const fileExtension = path.extname(file.originalFilename).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        
        if (!allowedTypes.includes(file.mimetype) || !allowedExtensions.includes(fileExtension)) {
          // Clean up the uploaded file
          try {
            await fs.unlink(file.filepath);
          } catch (unlinkError) {
            console.error('Error deleting invalid file:', unlinkError);
          }
          
          return res.status(400).json({ error: 'Only jpg and png file formats are allowed' });
        }
        
        if (!citySlug) {
          return res.status(400).json({ error: 'City slug is required' });
        }
        
        const cities = await readJsonFile('cities.json');
        if (!cities) {
          return res.status(500).json({ error: 'Failed to load cities data' });
        }
        
        const cityIndex = cities.findIndex(c => c.slug === citySlug);
        if (cityIndex === -1) {
          return res.status(404).json({ error: 'City not found' });
        }
        
        // Move file to uploads directory
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExtension}`;
        const newFilePath = path.join(form.uploadDir, fileName);
        
        try {
          await fs.rename(file.filepath, newFilePath);
        } catch (error) {
          console.error('Error moving file:', error);
          return res.status(500).json({ error: 'Failed to save file' });
        }
        
        // Add image to city's gallery
        const imageUrl = `/uploads/${fileName}`;
        const galleryItem = {
          id: Date.now().toString(),
          url: imageUrl,
          caption: caption.substring(0, 100),
          moderated: false,
          uploadedAt: new Date().toISOString()
        };
        
        if (!cities[cityIndex].gallery) {
          cities[cityIndex].gallery = [];
        }
        
        cities[cityIndex].gallery.push(galleryItem);
        
        const success = await writeJsonFile('cities.json', cities);
        
        if (success) {
          res.status(200).json({ 
            success: true, 
            message: 'Image uploaded successfully',
            image: galleryItem
          });
        } else {
          res.status(500).json({ error: 'Failed to save image data' });
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message || 'Upload failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}