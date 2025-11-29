import { readJsonFile, writeJsonFile } from '../../../utils/fileHelper';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { feedbackId } = req.body;
      
      // Read current feedback
      const feedback = await readJsonFile('feedback.json');
      
      if (!feedback) {
        return res.status(500).json({ error: 'Failed to load feedback' });
      }
      
      // Filter out the feedback item to delete
      const updatedFeedback = feedback.filter(item => item.id !== feedbackId);
      
      // Check if item was actually removed
      if (updatedFeedback.length === feedback.length) {
        return res.status(404).json({ error: 'Feedback not found' });
      }
      
      // Save updated feedback
      const success = await writeJsonFile('feedback.json', updatedFeedback);
      
      if (success) {
        res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
      } else {
        res.status(500).json({ error: 'Failed to save changes' });
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}