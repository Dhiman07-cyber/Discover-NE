import { readJsonFile, writeJsonFile } from '../../../utils/fileHelper';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { feedbackId, markAll } = req.body;
      
      // Read current feedback
      const feedback = await readJsonFile('feedback.json');
      
      if (!feedback) {
        return res.status(500).json({ error: 'Failed to load feedback' });
      }
      
      let updatedFeedback;
      
      if (markAll) {
        // Mark all feedback as read
        updatedFeedback = feedback.map(item => ({ ...item, read: true }));
      } else {
        // Mark specific feedback as read
        updatedFeedback = feedback.map(item => 
          item.id === feedbackId ? { ...item, read: true } : item
        );
      }
      
      // Save updated feedback
      const success = await writeJsonFile('feedback.json', updatedFeedback);
      
      if (success) {
        res.status(200).json({ success: true, message: 'Feedback marked as read successfully' });
      } else {
        res.status(500).json({ error: 'Failed to save changes' });
      }
    } catch (error) {
      console.error('Failed to mark feedback as read:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}