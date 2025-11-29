export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { password } = req.body;
      
      // In a real app, this would check against a database
      // For now, we'll use a simple check
      const ADMIN_PASS = process.env.ADMIN_PASS || '123456';
      
      if (password === ADMIN_PASS) {
        res.status(200).json({ success: true, message: 'Login successful' });
      } else {
        res.status(401).json({ error: 'Invalid password' });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}