import { readJsonFile } from '../../utils/fileHelper';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const states = await readJsonFile('states.json');
      if (states) {
        res.status(200).json(states);
      } else {
        res.status(500).json({ error: 'Failed to load states data' });
      }
    } catch (error) {
      console.error('Failed to load states:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}