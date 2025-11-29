import { readJsonFile } from '../../../utils/fileHelper';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Simplified for development - no password validation needed
      const feedback = await readJsonFile('feedback.json');
      
      if (feedback) {
        res.status(200).json(feedback);
      } else {
        res.status(500).json({ error: 'Failed to load feedback' });
      }
    } catch (error) {
      console.error('Failed to load feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}