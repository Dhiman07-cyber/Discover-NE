import { readJsonFile, writeJsonFile } from '../../utils/fileHelper';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { name, email, message } = req.body;
      
      // Validate input
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
      }
      
      if (!email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
      }
      
      const feedback = await readJsonFile('feedback.json') || [];
      
      const newFeedback = {
        id: Date.now().toString(),
        name: name.substring(0, 100),
        email: email.substring(0, 100),
        message: message.substring(0, 1000),
        timestamp: new Date().toISOString()
      };
      
      feedback.push(newFeedback);
      
      const success = await writeJsonFile('feedback.json', feedback);
      
      if (success) {
        res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to save feedback' });
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Feedback ID is required' });
      }
      
      const feedback = await readJsonFile('feedback.json') || [];
      
      // Filter out the feedback item with the given ID
      const updatedFeedback = feedback.filter(item => item.id !== id);
      
      // Check if any feedback was actually removed
      if (updatedFeedback.length === feedback.length) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      const success = await writeJsonFile('feedback.json', updatedFeedback);
      
      if (success) {
        res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to delete feedback' });
      }
    } catch (error) {
      console.error('Feedback deletion error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}