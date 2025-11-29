import '../styles/globals.css';
import '../styles/styles.css';
import '../styles/components.css';
import '../styles/hero-slider.css';
import '../styles/hero-slider-fix.css';
import '../styles/city-hero-slider.css';
import '../styles/admin.css';
import '../styles/admin-enhanced.css';
import ChatBot from '../components/ChatBot';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [showChatBot, setShowChatBot] = useState(true);

  useEffect(() => {
    // Check if we're on an admin page
    const isAdminPage = router.pathname.startsWith('/admin');
    setShowChatBot(!isAdminPage);
  }, [router.pathname]);

  return (
    <>
      <Component {...pageProps} />
      {showChatBot && <ChatBot />}
    </>
  );
}

export default MyApp;