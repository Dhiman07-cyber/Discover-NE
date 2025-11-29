import { readJsonFile } from '../../../utils/fileHelper';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const cities = await readJsonFile('cities.json');
      
      if (!cities) {
        return res.status(500).json({ error: 'Failed to load cities data' });
      }
      
      const city = cities.find(c => c.slug === slug);
      if (!city) {
        return res.status(404).json({ error: 'City not found' });
      }
      
      res.status(200).json(city);
    } catch (error) {
      console.error('Failed to load city:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}