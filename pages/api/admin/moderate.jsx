import { readJsonFile, writeJsonFile } from '../../../utils/fileHelper';

// Admin authentication middleware
function authenticateAdmin(req, res) {
  const { password } = req.body;
  const ADMIN_PASS = process.env.ADMIN_PASS || '123456'; // Use the same password as in the frontend
  
  if (password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Invalid admin password' });
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Authenticate admin
      authenticateAdmin(req, res);
      
      const { citySlug, imageId, action, newCitySlug } = req.body;
      
      if (!citySlug || !imageId || !action) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }
      
      const cities = await readJsonFile('cities.json');
      if (!cities) {
        return res.status(500).json({ error: 'Failed to load cities data' });
      }
      
      // Handle different actions
      if (action === 'delete') {
        // Delete an approved image
        let imageFound = false;
        
        // Find the image in any city
        for (let i = 0; i < cities.length; i++) {
          if (cities[i].gallery) {
            const imageIndex = cities[i].gallery.findIndex(img => img.id === imageId);
            if (imageIndex !== -1) {
              // Remove the image
              cities[i].gallery.splice(imageIndex, 1);
              imageFound = true;
              break;
            }
          }
        }
        
        if (!imageFound) {
          return res.status(404).json({ error: 'Image not found' });
        }
        
        // Save changes
        const success = await writeJsonFile('cities.json', cities);
        
        if (success) {
          res.status(200).json({ success: true, message: 'Image deleted successfully' });
        } else {
          res.status(500).json({ error: 'Failed to save changes' });
        }
      } else if (action === 'move' && newCitySlug) {
        // Move an approved image to a different city
        let imageToMove = null;
        let currentCityIndex = -1;
        let imageIndex = -1;
        
        // Find the image in any city
        for (let i = 0; i < cities.length; i++) {
          if (cities[i].gallery) {
            const idx = cities[i].gallery.findIndex(img => img.id === imageId);
            if (idx !== -1) {
              imageToMove = cities[i].gallery[idx];
              currentCityIndex = i;
              imageIndex = idx;
              break;
            }
          }
        }
        
        if (!imageToMove) {
          return res.status(404).json({ error: 'Image not found' });
        }
        
        // Remove from current city
        cities[currentCityIndex].gallery.splice(imageIndex, 1);
        
        // Add to new city
        const newCityIndex = cities.findIndex(c => c.slug === newCitySlug);
        if (newCityIndex === -1) {
          return res.status(404).json({ error: 'New city not found' });
        }
        
        if (!cities[newCityIndex].gallery) {
          cities[newCityIndex].gallery = [];
        }
        
        // Keep the image moderated status
        cities[newCityIndex].gallery.push(imageToMove);
        
        // Save changes
        const success = await writeJsonFile('cities.json', cities);
        
        if (success) {
          res.status(200).json({ success: true, message: `Image moved to ${newCitySlug} successfully` });
        } else {
          res.status(500).json({ error: 'Failed to save changes' });
        }
      } else if (action === 'approve' && newCitySlug && newCitySlug !== citySlug) {
        // Moving image to a different city during approval
        let imageToMove = null;
        let currentCityIndex = -1;
        let imageIndex = -1;
        
        // Find the image in any city
        for (let i = 0; i < cities.length; i++) {
          if (cities[i].gallery) {
            const idx = cities[i].gallery.findIndex(img => img.id === imageId);
            if (idx !== -1) {
              imageToMove = cities[i].gallery[idx];
              currentCityIndex = i;
              imageIndex = idx;
              break;
            }
          }
        }
        
        if (!imageToMove) {
          return res.status(404).json({ error: 'Image not found' });
        }
        
        // Remove from current city
        cities[currentCityIndex].gallery.splice(imageIndex, 1);
        
        // Add to new city
        const newCityIndex = cities.findIndex(c => c.slug === newCitySlug);
        if (newCityIndex === -1) {
          return res.status(404).json({ error: 'New city not found' });
        }
        
        if (!cities[newCityIndex].gallery) {
          cities[newCityIndex].gallery = [];
        }
        
        imageToMove.moderated = true; // Approve when moving
        cities[newCityIndex].gallery.push(imageToMove);
        
        // Save changes
        const success = await writeJsonFile('cities.json', cities);
        
        if (success) {
          res.status(200).json({ success: true, message: `Image approved and moved to ${newCitySlug} successfully` });
        } else {
          res.status(500).json({ error: 'Failed to save changes' });
        }
      } else {
        // Standard approval/rejection in the same city
        const cityIndex = cities.findIndex(c => c.slug === citySlug);
        if (cityIndex === -1) {
          return res.status(404).json({ error: 'City not found' });
        }
        
        const gallery = cities[cityIndex].gallery || [];
        const imageIndex = gallery.findIndex(img => img.id === imageId);
        
        if (imageIndex === -1) {
          return res.status(404).json({ error: 'Image not found' });
        }
        
        if (action === 'approve') {
          gallery[imageIndex].moderated = true;
        } else if (action === 'reject') {
          // Remove the image
          gallery.splice(imageIndex, 1);
        } else {
          return res.status(400).json({ error: 'Invalid action' });
        }
        
        cities[cityIndex].gallery = gallery;
        
        const success = await writeJsonFile('cities.json', cities);
        
        if (success) {
          res.status(200).json({ success: true, message: `Image ${action}d successfully` });
        } else {
          res.status(500).json({ error: 'Failed to save changes' });
        }
      }
    } catch (error) {
      console.error('Image moderation error:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}