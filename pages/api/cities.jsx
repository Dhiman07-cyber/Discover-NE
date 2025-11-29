import { readJsonFile } from '../../utils/fileHelper';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const cities = await readJsonFile('cities.json');
      if (cities) {
        res.status(200).json(cities);
      } else {
        res.status(500).json({ error: 'Failed to load cities data' });
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}