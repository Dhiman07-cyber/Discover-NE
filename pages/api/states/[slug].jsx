import { readJsonFile } from '../../../utils/fileHelper';

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const states = await readJsonFile('states.json');
      const cities = await readJsonFile('cities.json');
      
      if (!states || !cities) {
        return res.status(500).json({ error: 'Failed to load data' });
      }
      
      const state = states.find(s => s.slug === slug);
      if (!state) {
        return res.status(404).json({ error: 'State not found' });
      }
      
      // Get cities for this state
      const stateCities = cities.filter(c => c.stateSlug === slug);
      
      res.status(200).json({
        ...state,
        citiesData: stateCities
      });
    } catch (error) {
      console.error('Failed to load state:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}