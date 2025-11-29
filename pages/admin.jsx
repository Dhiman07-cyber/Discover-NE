import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllStates, getAllCities, getFeedback, updateState, updateCity, moderateImage, adminLogin, deleteFeedback } from '../utils/data';
import { FiLogOut, FiHome, FiMap, FiImage, FiMessageSquare, FiEdit, FiCheck, FiX, FiTrash2, FiArrowRight, FiChevronDown } from 'react-icons/fi';

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('feedback');
  const [stats, setStats] = useState({ states: 0, cities: 0, images: 0, feedback: 0 });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);
  const [approvedImages, setApprovedImages] = useState([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [editingImage, setEditingImage] = useState(null);

  // Check for saved login state on component mount
  useEffect(() => {
    const savedLoginState = localStorage.getItem('adminLoginState');
    if (savedLoginState) {
      const { isLoggedIn: savedIsLoggedIn, username: savedUsername, password: savedPassword } = JSON.parse(savedLoginState);
      // Only restore login state if it's valid (username and password match development credentials)
      if (savedIsLoggedIn && savedUsername === 'username' && savedPassword === '123456') {
        setIsLoggedIn(true);
        setUsername(savedUsername);
        setPassword(savedPassword);
      }
    }
  }, []);

  // Poll for new data periodically
  useEffect(() => {
    let intervalId;
    
    if (isLoggedIn) {
      // Load data immediately when logged in
      loadDashboardData();
      
      // Set up polling every 30 seconds
      intervalId = setInterval(() => {
        loadDashboardData(true); // Silent update
      }, 30000);
    }
    
    // Clean up interval on unmount or when logged out
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn]);

  // Load data when component mounts or when login state changes
  useEffect(() => {
    if (isLoggedIn) {
      // Save login state to localStorage only if it's valid
      if (username === 'username' && password === '123456') {
        localStorage.setItem('adminLoginState', JSON.stringify({ 
          isLoggedIn: true, 
          username, 
          password 
        }));
      }
      loadDashboardData();
    }
  }, [isLoggedIn, username, password]);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsDataLoading(true);
    try {
      // Fetch actual feedback data along with states and cities
      const [statesData, citiesData, feedbackData] = await Promise.all([
        getAllStates(),
        getAllCities(),
        getFeedback() // No password needed anymore
      ]);

      // Debug: Log feedback data structure
      console.log('Feedback data structure:', feedbackData);
      console.log('Feedback data type:', typeof feedbackData);
      console.log('Feedback data length:', feedbackData ? feedbackData.length : 'undefined');
      if (feedbackData && feedbackData.length > 0) {
        console.log('Sample feedback item:', feedbackData[0]);
        console.log('Sample feedback message:', feedbackData[0].message);
        console.log('Message type:', typeof feedbackData[0].message);
        console.log('Message length:', feedbackData[0].message ? feedbackData[0].message.length : 'null');
      }

      // Only update states if they've changed
      setStates(prevStates => {
        if (JSON.stringify(prevStates) !== JSON.stringify(statesData)) {
          return statesData;
        }
        return prevStates;
      });
      
      // Only update cities if they've changed
      setCities(prevCities => {
        if (JSON.stringify(prevCities) !== JSON.stringify(citiesData)) {
          return citiesData;
        }
        return prevCities;
      });
      
      // Only update feedback if it's changed
      setFeedback(prevFeedback => {
        if (JSON.stringify(prevFeedback) !== JSON.stringify(feedbackData)) {
          return feedbackData; // Use actual feedback data instead of mock data
        }
        return prevFeedback;
      });

      // Calculate stats
      const totalImages = citiesData.reduce((total, city) => {
        return total + (city.gallery ? city.gallery.length : 0);
      }, 0);

      // Count total feedback
      const totalFeedbackCount = feedbackData.length;
      // Count unread feedback
      const unreadFeedbackCount = feedbackData.filter(item => !item.read).length;

      const newStats = {
        states: statesData.length,
        cities: citiesData.length,
        images: totalImages,
        feedback: unreadFeedbackCount, // Show unread feedback count in title
        totalFeedback: totalFeedbackCount // Show total feedback count in stat card
      };
      
      // Only update stats if they've changed
      setStats(prevStats => {
        if (JSON.stringify(prevStats) !== JSON.stringify(newStats)) {
          return newStats;
        }
        return prevStats;
      });

      // Collect pending images for moderation
      const pendingImagesList = [];
      const approvedImagesList = [];
      citiesData.forEach(city => {
        if (city.gallery) {
          city.gallery.forEach(img => {
            if (!img.moderated) {
              pendingImagesList.push({
                ...img,
                cityName: city.name,
                citySlug: city.slug
              });
            } else {
              approvedImagesList.push({
                ...img,
                cityName: city.name,
                citySlug: city.slug
              });
            }
          });
        }
      });
      
      // Only update images if they've changed
      setPendingImages(prevPending => {
        if (JSON.stringify(prevPending) !== JSON.stringify(pendingImagesList)) {
          return pendingImagesList;
        }
        return prevPending;
      });
      
      setApprovedImages(prevApproved => {
        if (JSON.stringify(prevApproved) !== JSON.stringify(approvedImagesList)) {
          return approvedImagesList;
        }
        return prevApproved;
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      if (!silent) {
        showNotification('Failed to load dashboard data', 'error');
      }
    } finally {
      if (!silent) setIsDataLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Development authentication - simple check
      if (username === 'username' && password === '123456') {
        setIsLoggedIn(true);
        // Save login state to localStorage
        localStorage.setItem('adminLoginState', JSON.stringify({ 
          isLoggedIn: true, 
          username, 
          password 
        }));
        showNotification('Login successful!', 'success');
      } else {
        setError('Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // New function to mark feedback as read
  const markFeedbackAsRead = async (feedbackId) => {
    try {
      // Make API call to mark feedback as read
      const response = await fetch('/api/admin/mark-feedback-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedbackId, markAll: false })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update local state immediately for UI feedback
        setFeedback(prevFeedback => 
          prevFeedback.map(item => 
            item.id === feedbackId ? { ...item, read: true } : item
          )
        );
        
        // Update stats to reflect unread count (ensure it doesn't go below 0)
        setStats(prevStats => {
          const newCount = Math.max(0, prevStats.feedback - 1);
          return { ...prevStats, feedback: newCount };
        });
        
        showNotification('Feedback marked as read!', 'success');
      } else {
        throw new Error(result.error || 'Failed to mark feedback as read');
      }
    } catch (error) {
      console.error('Failed to mark feedback as read:', error);
      showNotification('Failed to mark feedback as read: ' + error.message, 'error');
    }
  };

  // New function to mark all feedback as read
  const markAllFeedbackAsRead = async () => {
    try {
      // Make API call to mark all feedback as read
      const response = await fetch('/api/admin/mark-feedback-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAll: true })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Update local state immediately for UI feedback
        setFeedback(prevFeedback => 
          prevFeedback.map(item => ({ ...item, read: true }))
        );
        
        // Update stats to reflect unread count
        setStats(prevStats => ({ ...prevStats, feedback: 0 }));
        
        showNotification('All feedback marked as read!', 'success');
      } else {
        throw new Error(result.error || 'Failed to mark all feedback as read');
      }
    } catch (error) {
      console.error('Failed to mark all feedback as read:', error);
      showNotification('Failed to mark all feedback as read: ' + error.message, 'error');
    }
  };

  // Ensure feedback message is displayed properly
  const renderFeedbackMessage = (message) => {
    if (!message) return 'No message provided';
    
    // Handle both string and object messages
    if (typeof message === 'object') {
      return message.content || message.text || JSON.stringify(message);
    }
    
    return message;
  };

  // Debug function to check feedback data
  const debugFeedbackData = () => {
    console.log('Current feedback data:', feedback);
    feedback.forEach((item, index) => {
      console.log(`Feedback ${index}:`, item);
      console.log(`  ID: ${item.id}`);
      console.log(`  Message type: ${typeof item.message}`);
      console.log(`  Message content:`, item.message);
    });
  };

  // Call debug on component mount
  useEffect(() => {
    debugFeedbackData();
  }, []);

  const handleLogout = () => {
    setIsLoading(true);
    // Add a small delay to show the loading spinner
    setTimeout(() => {
      setIsLoggedIn(false);
      setUsername('');
      setPassword('');
      setStates([]);
      setCities([]);
      setFeedback([]);
      setPendingImages([]);
      setApprovedImages([]);
      setSelectedState(null);
      setSelectedCity(null);
      setActiveTab('dashboard');
      // Remove login state from localStorage
      localStorage.removeItem('adminLoginState');
      setIsLoading(false);
    }, 1000);
  };

  const handleStateSelect = (stateSlug) => {
    const state = states.find(s => s.slug === stateSlug);
    setSelectedState(state);
  };

  const handleCitySelect = (citySlug) => {
    const city = cities.find(c => c.slug === citySlug);
    setSelectedCity(city);
  };

  const handleStateUpdate = async (formData) => {
    try {
      // For development mode, we'll simulate the update
      console.log('State update data:', formData);
      showNotification('State updated successfully! (Development Mode)', 'success');
      
      // Update specific state in the states array
      setStates(prevStates => 
        prevStates.map(state => 
          state.slug === formData.slug ? { ...state, ...formData } : state
        )
      );
    } catch (error) {
      showNotification('Failed to update state', 'error');
    }
  };

  const handleCityUpdate = async (formData) => {
    try {
      // For development mode, we'll simulate the update
      console.log('City update data:', formData);
      showNotification('City updated successfully! (Development Mode)', 'success');
      
      // Update specific city in the cities array
      setCities(prevCities => 
        prevCities.map(city => 
          city.slug === formData.slug ? { ...city, ...formData } : city
        )
      );
    } catch (error) {
      showNotification('Failed to update city', 'error');
    }
  };

  // New function to handle deletion of approved images with immediate UI update
  const handleDeleteApprovedImage = async (citySlug, imageId) => {
    try {
      const response = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          citySlug, 
          imageId, 
          action: 'delete'
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification(result.message || 'Image deleted successfully!', 'success');
        
        // Update state directly instead of refreshing all data
        setApprovedImages(prev => prev.filter(img => img.id !== imageId));
        
        // Also update cities data
        setCities(prevCities => {
          return prevCities.map(city => {
            if (city.slug === citySlug && city.gallery) {
              return {
                ...city,
                gallery: city.gallery.filter(img => img.id !== imageId)
              };
            }
            return city;
          });
        });
      } else {
        throw new Error(result.error || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Image deletion error:', error);
      showNotification(`Failed to delete image: ${error.message}`, 'error');
    }
  };

  // Function to handle editing image location
  const handleEditImageLocation = (image) => {
    setEditingImage({
      ...image,
      newStateSlug: image.stateSlug,
      newCitySlug: image.citySlug
    });
    setShowEditLocationModal(true);
  };

  // Function to handle state change in edit form
  const handleStateChange = (stateSlug) => {
    setEditingImage(prev => ({
      ...prev,
      newStateSlug: stateSlug,
      newCitySlug: ''
    }));
  };

  // Function to handle city change in edit form
  const handleCityChange = (citySlug) => {
    setEditingImage(prev => ({
      ...prev,
      newCitySlug: citySlug
    }));
  };

  // Function to cancel editing image location
  const cancelEditImageLocation = () => {
    setShowEditLocationModal(false);
    setEditingImage(null);
  };

  // Function to move image to a different city
  const handleMoveImage = async () => {
    if (!editingImage || !editingImage.newCitySlug) {
      showNotification('Please select a city', 'error');
      return;
    }

    try {
      const response = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          citySlug: editingImage.citySlug, 
          imageId: editingImage.id, 
          action: 'move',
          newCitySlug: editingImage.newCitySlug
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification(result.message || 'Image moved successfully!', 'success');
        
        // Update state directly instead of refreshing all data
        setApprovedImages(prev => 
          prev.map(img => 
            img.id === editingImage.id 
              ? { ...img, editing: false, cityName: cities.find(c => c.slug === editingImage.newCitySlug)?.name || img.cityName, citySlug: editingImage.newCitySlug } 
              : img
          )
        );
        
        // Also update cities data
        setCities(prevCities => {
          return prevCities.map(city => {
            // Remove from old city
            if (city.slug === editingImage.citySlug && city.gallery) {
              return {
                ...city,
                gallery: city.gallery.filter(img => img.id !== editingImage.id)
              };
            }
            // Add to new city
            if (city.slug === editingImage.newCitySlug) {
              const oldCity = prevCities.find(c => c.slug === editingImage.citySlug);
              const movedImage = oldCity?.gallery?.find(img => img.id === editingImage.id);
              if (movedImage) {
                return {
                  ...city,
                  gallery: [...(city.gallery || []), movedImage]
                };
              }
            }
            return city;
          });
        });
        
        // Close modal
        setShowEditLocationModal(false);
        setEditingImage(null);
      } else {
        throw new Error(result.error || 'Failed to move image');
      }
    } catch (error) {
      console.error('Image move error:', error);
      showNotification(`Failed to move image: ${error.message}`, 'error');
    }
  };

  // New function to handle disapproving approved images with immediate UI update
  const handleDisapproveImage = async (citySlug, imageId) => {
    try {
      const response = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          password,
          citySlug, 
          imageId, 
          action: 'disapprove'
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        showNotification(result.message || 'Image disapproved successfully!', 'success');
        
        // Update state directly instead of refreshing all data
        // Remove from approved images
        setApprovedImages(prevApproved => prevApproved.filter(img => img.id !== imageId));
        
        // Add to pending images
        const image = approvedImages.find(img => img.id === imageId);
        if (image) {
          setPendingImages(prevPending => [...prevPending, { ...image, moderated: false }]);
        }
        
        // Also update cities data
        setCities(prevCities => {
          return prevCities.map(city => {
            if (city.slug === citySlug && city.gallery) {
              return {
                ...city,
                gallery: city.gallery.map(img => 
                  img.id === imageId ? { ...img, moderated: false } : img
                )
              };
            }
            return city;
          });
        });
      } else {
        throw new Error(result.error || 'Failed to disapprove image');
      }
    } catch (error) {
      console.error('Image disapproval error:', error);
      showNotification(`Failed to disapprove image: ${error.message}`, 'error');
    }
  };


  // Function to approve all pending images
  const handleApproveAllImages = async () => {
    if (pendingImages.length === 0) {
      showNotification('No pending images to approve', 'info');
      return;
    }
    
    try {
      // Process all pending images
      const results = await Promise.all(
        pendingImages.map(image => 
          fetch('/api/admin/moderate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              password,
              citySlug: image.citySlug, 
              imageId: image.id, 
              action: 'approve'
            }),
          })
        )
      );
      
      // Check if all were successful
      const allSuccessful = results.every(response => response.ok);
      
      if (allSuccessful) {
        showNotification(`Successfully approved ${pendingImages.length} images!`, 'success');
        
        // Move all pending images to approved
        setApprovedImages(prev => [...prev, ...pendingImages.map(img => ({ ...img, moderated: true }))]);
        setPendingImages([]);
        
        // Update cities data
        setCities(prevCities => {
          return prevCities.map(city => {
            if (city.gallery) {
              return {
                ...city,
                gallery: city.gallery.map(img => ({ ...img, moderated: true }))
              };
            }
            return city;
          });
        });
      } else {
        showNotification('Some images failed to approve. Please check individually.', 'error');
      }
    } catch (error) {
      console.error('Bulk approve error:', error);
      showNotification(`Failed to approve all images: ${error.message}`, 'error');
    }
  };

  // Function to reject all pending images
  const handleRejectAllImages = async () => {
    if (pendingImages.length === 0) {
      showNotification('No pending images to reject', 'info');
      return;
    }
    
    try {
      // Process all pending images
      const results = await Promise.all(
        pendingImages.map(image => 
          fetch('/api/admin/moderate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              password,
              citySlug: image.citySlug, 
              imageId: image.id, 
              action: 'reject'
            }),
          })
        )
      );
      
      // Check if all were successful
      const allSuccessful = results.every(response => response.ok);
      
      if (allSuccessful) {
        showNotification(`Successfully rejected ${pendingImages.length} images!`, 'success');
        
        // Clear pending images
        setPendingImages([]);
        
        // Update cities data to remove rejected images
        setCities(prevCities => {
          return prevCities.map(city => {
            if (city.gallery) {
              return {
                ...city,
                gallery: city.gallery.filter(img => 
                  !pendingImages.some(pendingImg => pendingImg.id === img.id)
                )
              };
            }
            return city;
          });
        });
      } else {
        showNotification('Some images failed to reject. Please check individually.', 'error');
      }
    } catch (error) {
      console.error('Bulk reject error:', error);
      showNotification(`Failed to reject all images: ${error.message}`, 'error');
    }
  };

  // Function to delete all approved images
  const handleDeleteAllApprovedImages = async () => {
    if (approvedImages.length === 0) {
      showNotification('No approved images to delete', 'info');
      return;
    }
    
    try {
      // Process all approved images
      const results = await Promise.all(
        approvedImages.map(image => 
          fetch('/api/admin/moderate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              password,
              citySlug: image.citySlug, 
              imageId: image.id, 
              action: 'delete'
            }),
          })
        )
      );
      
      // Check if all were successful
      const allSuccessful = results.every(response => response.ok);
      
      if (allSuccessful) {
        showNotification(`Successfully deleted ${approvedImages.length} images!`, 'success');
        
        // Clear approved images
        setApprovedImages([]);
        
        // Update cities data to remove deleted images
        setCities(prevCities => {
          return prevCities.map(city => {
            if (city.gallery) {
              return {
                ...city,
                gallery: city.gallery.filter(img => 
                  !approvedImages.some(approvedImg => approvedImg.id === img.id)
                )
              };
            }
            return city;
          });
        });
      } else {
        showNotification('Some images failed to delete. Please check individually.', 'error');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      showNotification(`Failed to delete all images: ${error.message}`, 'error');
    }
  };

  // Function to delete all pending images
  const handleDeleteAllPendingImages = async () => {
    if (pendingImages.length === 0) {
      showNotification('No pending images to delete', 'info');
      return;
    }
    
    try {
      // Process all pending images
      const results = await Promise.all(
        pendingImages.map(image => 
          fetch('/api/admin/moderate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              password,
              citySlug: image.citySlug, 
              imageId: image.id, 
              action: 'delete'
            }),
          })
        )
      );
      
      // Check if all were successful
      const allSuccessful = results.every(response => response.ok);
      
      if (allSuccessful) {
        showNotification(`Successfully deleted ${pendingImages.length} images!`, 'success');
        
        // Clear pending images
        setPendingImages([]);
        
        // Update cities data to remove deleted images
        setCities(prevCities => {
          return prevCities.map(city => {
            if (city.gallery) {
              return {
                ...city,
                gallery: city.gallery.filter(img => 
                  !pendingImages.some(pendingImg => pendingImg.id === img.id)
                )
              };
            }
            return city;
          });
        });
      } else {
        showNotification('Some images failed to delete. Please check individually.', 'error');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      showNotification(`Failed to delete all images: ${error.message}`, 'error');
    }
  };

  // Update the handleImageModeration function to handle the move action
  const handleImageModeration = async (citySlug, imageId, action) => {
    try {
      // Make actual API call
      const response = await fetch('/api/admin/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          password, 
          citySlug, 
          imageId, 
          action
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification(result.message || `Image ${action}d successfully`, 'success');
        
        // Update state directly instead of refreshing all data
        if (action === 'approve') {
          // Remove from pending images
          setPendingImages(prev => prev.filter(img => img.id !== imageId));
          
          // Add to approved images
          const image = pendingImages.find(img => img.id === imageId);
          if (image) {
            setApprovedImages(prev => [...prev, { ...image, moderated: true }]);
          }
        } else if (action === 'reject') {
          // Remove from pending images
          setPendingImages(prev => prev.filter(img => img.id !== imageId));
        }
      } else {
        showNotification(result.error || `Failed to ${action} image`, 'error');
      }
    } catch (error) {
      console.error('Moderation error:', error);
      showNotification('Failed to moderate image', 'error');
    }
  };

  // Handle form submission for state updates
  const handleStateFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const stateData = {
      slug: selectedState.slug,
      name: formData.get('name'),
      description: formData.get('description'),
      history: formData.get('history'),
      capital: formData.get('capital'),
      languages: formData.get('languages'),
      bestTime: formData.get('bestTime')
    };
    
    // Handle highlights as array
    const highlights = formData.get('highlights').split(',').map(item => item.trim()).filter(item => item);
    stateData.highlights = highlights;
    
    // Handle quick facts as array of objects
    const quickFacts = [];
    const quickFactTitles = formData.getAll('quickFactTitle');
    const quickFactDescriptions = formData.getAll('quickFactDescription');
    
    for (let i = 0; i < quickFactTitles.length; i++) {
      if (quickFactTitles[i] && quickFactDescriptions[i]) {
        quickFacts.push({
          title: quickFactTitles[i],
          description: quickFactDescriptions[i]
        });
      }
    }
    stateData.quickFacts = quickFacts;
    
    // Handle festivals as array of objects
    const festivals = [];
    const festivalNames = formData.getAll('festivalName');
    const festivalSummaries = formData.getAll('festivalSummary');
    
    for (let i = 0; i < festivalNames.length; i++) {
      if (festivalNames[i] && festivalSummaries[i]) {
        festivals.push({
          name: festivalNames[i],
          summary: festivalSummaries[i]
        });
      }
    }
    stateData.festivals = festivals;
    
    handleStateUpdate(stateData);
  };

  // Handle form submission for city updates
  const handleCityFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const cityData = {
      slug: selectedCity.slug,
      name: formData.get('name'),
      summary: formData.get('summary'),
      history: formData.get('history')
    };
    
    // Handle quick info as array of objects
    const quickInfo = [];
    const quickInfoTitles = formData.getAll('quickInfoTitle');
    const quickInfoDescriptions = formData.getAll('quickInfoDescription');
    
    for (let i = 0; i < quickInfoTitles.length; i++) {
      if (quickInfoTitles[i] && quickInfoDescriptions[i]) {
        quickInfo.push({
          title: quickInfoTitles[i],
          description: quickInfoDescriptions[i]
        });
      }
    }
    cityData.quickInfo = quickInfo;
    
    // Handle local specialties as array
    const localSpecialties = formData.get('localSpecialties').split(',').map(item => item.trim()).filter(item => item);
    cityData.localSpecialties = localSpecialties;
    
    // Handle explore items as array of objects
    const exploreItems = [];
    const exploreTitles = formData.getAll('exploreTitle');
    const exploreDescs = formData.getAll('exploreDesc');
    
    for (let i = 0; i < exploreTitles.length; i++) {
      if (exploreTitles[i] && exploreDescs[i]) {
        exploreItems.push({
          title: exploreTitles[i],
          desc: exploreDescs[i]
        });
      }
    }
    cityData.explore = exploreItems;
    
    handleCityUpdate(cityData);
  };

  // Add a new festival input field
  const addFestivalField = () => {
    const festivalsContainer = document.getElementById('festivalsContainer');
    const newFestivalDiv = document.createElement('div');
    newFestivalDiv.className = 'form-row';
    newFestivalDiv.innerHTML = `
      <div class="form-group">
        <label>Festival Name</label>
        <input type="text" name="festivalName" class="form-control" />
      </div>
      <div class="form-group">
        <label>Summary</label>
        <input type="text" name="festivalSummary" class="form-control" />
      </div>
    `;
    festivalsContainer.appendChild(newFestivalDiv);
  };

  // Add a new explore item input field
  const addExploreItemField = () => {
    const exploreContainer = document.getElementById('exploreContainer');
    const newExploreDiv = document.createElement('div');
    newExploreDiv.className = 'form-row';
    newExploreDiv.innerHTML = `
      <div class="form-group">
        <label>Explore Title</label>
        <input type="text" name="exploreTitle" class="form-control" />
      </div>
      <div class="form-group">
        <label>Description</label>
        <input type="text" name="exploreDesc" class="form-control" />
      </div>
      <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
    `;
    exploreContainer.appendChild(newExploreDiv);
  };

  // Add a new quick fact input field
  const addQuickFactField = () => {
    const quickFactsContainer = document.getElementById('quickFactsContainer');
    const newQuickFactDiv = document.createElement('div');
    newQuickFactDiv.className = 'form-row';
    newQuickFactDiv.innerHTML = `
      <div class="form-group">
        <label>Fact Title</label>
        <input type="text" name="quickFactTitle" class="form-control" />
      </div>
      <div class="form-group">
        <label>Fact Description</label>
        <input type="text" name="quickFactDescription" class="form-control" />
      </div>
      <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
    `;
    quickFactsContainer.appendChild(newQuickFactDiv);
  };

  // Add a new quick info input field
  const addQuickInfoField = () => {
    const quickInfoContainer = document.getElementById('quickInfoContainer');
    const newQuickInfoDiv = document.createElement('div');
    newQuickInfoDiv.className = 'form-row';
    newQuickInfoDiv.innerHTML = `
      <div class="form-group">
        <label>Info Title</label>
        <input type="text" name="quickInfoTitle" class="form-control" />
      </div>
      <div class="form-group">
        <label>Info Description</label>
        <input type="text" name="quickInfoDescription" class="form-control" />
      </div>
      <button type="button" class="btn btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
    `;
    quickInfoContainer.appendChild(newQuickInfoDiv);
  };

  const handleDeleteFeedback = async (feedbackId) => {
    // Set the feedback to delete and show the confirmation modal
    setFeedbackToDelete(feedbackId);
    setShowDeleteModal(true);
  };

  // Function to delete all feedback
  const handleDeleteAllFeedback = async () => {
    if (feedback.length === 0) {
      showNotification('No feedback to delete', 'info');
      return;
    }
    
    try {
      // Create a copy of feedback array to ensure we have all items
      const feedbackToDelete = [...feedback];
      
      // Delete all feedback items one by one to ensure reliability
      let successCount = 0;
      let errorCount = 0;
      
      for (const item of feedbackToDelete) {
        try {
          await deleteFeedback(item.id);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete feedback ${item.id}:`, error);
          errorCount++;
        }
      }
      
      // Update feedback state directly
      setFeedback([]);
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        feedback: 0,
        totalFeedback: prevStats.totalFeedback ? prevStats.totalFeedback - successCount : 0
      }));
      
      if (errorCount === 0) {
        showNotification(`Successfully deleted ${successCount} feedback items!`, 'success');
      } else {
        showNotification(`Deleted ${successCount} feedback items. Failed to delete ${errorCount} items.`, 'warning');
      }
    } catch (error) {
      console.error('Failed to delete all feedback:', error);
      showNotification('Failed to delete all feedback: ' + error.message, 'error');
    }
  };

  const confirmDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    
    try {
      const result = await deleteFeedback(feedbackToDelete);
      
      if (result.success) {
        // Update feedback state directly instead of refreshing all data
        setFeedback(prevFeedback => prevFeedback.filter(item => item.id !== feedbackToDelete));
        
        // Update stats - properly handle both feedback (unread count) and totalFeedback
        setStats(prevStats => {
          const newFeedbackCount = Math.max(0, prevStats.feedback - 1);
          const newTotalFeedback = prevStats.totalFeedback ? Math.max(0, prevStats.totalFeedback - 1) : 0;
          
          return {
            ...prevStats,
            feedback: newFeedbackCount,
            totalFeedback: newTotalFeedback
          };
        });
        
        showNotification('Feedback deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Failed to delete feedback:', error);
      showNotification('Failed to delete feedback: ' + error.message, 'error');
    } finally {
      // Close the modal and reset
      setShowDeleteModal(false);
      setFeedbackToDelete(null);
    }
  };

  const cancelDeleteFeedback = () => {
    setShowDeleteModal(false);
    setFeedbackToDelete(null);
  };

  // Function to export feedback to CSV
  const exportFeedbackToCSV = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Message', 'Timestamp'];
      const rows = feedback.map(item => [
        `"${item.name || ''}"`,
        `"${item.email || ''}"`,
        `"${item.message || ''}"`,
        `"${item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}"`
      ]);
      
      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `feedback_export_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Feedback exported successfully!', 'success');
    } catch (error) {
      console.error('Failed to export feedback:', error);
      showNotification('Failed to export feedback: ' + error.message, 'error');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-login-page">
        <Head>
          <title>Admin Login - Discover NorthEast India</title>
          <meta name="description" content="Admin login for Discover NorthEast India" />
        </Head>
        
        {/* Navigation Header - Added from home page */}
        <header className="main-header">
          <nav className="navbar" role="navigation" aria-label="Main navigation">
            <div className="container">
              <div className="nav-brand">
                <h1 className="logo" onClick={() => window.location.href = '/'}>Discover NorthEast</h1>
              </div>
              <ul className="nav-menu">
                <li><a href="/">Home</a></li>
                <li><a href="/#states">States</a></li>
                <li><a href="/#highlights">Highlights</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="/admin" className="admin-link active">Admin</a></li>
              </ul>
              <button className="nav-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </nav>
        </header>

        <div className="admin-login">
          <motion.div 
            className="login-card premium-login-card"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="logo-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <span className="logo-icon">🔒</span>
            </motion.div>
            
            <motion.div 
              className="login-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2>Admin Portal</h2>
              <p>Secure access to content management</p>
            </motion.div>
            
            {notification.show && (
              <motion.div 
                className={`admin-message ${notification.type} show`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {notification.message}
              </motion.div>
            )}
            
            <form onSubmit={handleLogin}>
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="username">Username</label>
                <div className="input-with-icon">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-control"
                    placeholder="Enter username"
                    required
                    autoComplete="username"
                  />
                </div>
              </motion.div>
              
              <motion.div 
                className="form-group"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <span className="input-icon">🔑</span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </motion.div>
              
              {error && (
                <motion.div 
                  className="admin-message error show"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
              
              <motion.button
                type="submit"
                disabled={isLoading}
                className="btn btn-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Authenticating...
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </motion.button>
            </form>
            

          </motion.div>
        </div>
        
        {/* Footer */}
        <footer className="main-footer" id="contact">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>Contact Us</h3>
                <p>Email: <a href="mailto:info@discovernortheast.com">info@discovernortheast.com</a></p>
                <p>Phone: +91 98765 43210</p>
                <p>Follow us on social media for updates!</p>
              </div>
              <div className="footer-section">
                <h3>Quick Links</h3>
                <ul>
                  <li><a href="/">Home</a></li>
                  <li><a href="/#states">All States</a></li>
                  <li><a href="/admin">Admin Portal</a></li>
                  <li><a href="#contact">Contact</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h3>Explore More</h3>
                <p>Discover the beauty of NorthEast India</p>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 Discover NorthEast. Made with ❤️ for Hackathon</p>
              <p className="footer-disclaimer">This website is for educational purposes only. All images are for demonstration.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <Head>
        <title>Admin Dashboard - Discover NorthEast India</title>
        <meta name="description" content="Admin dashboard for managing Discover NorthEast India content" />
      </Head>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this feedback? This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button onClick={cancelDeleteFeedback} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={confirmDeleteFeedback} className="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {showEditLocationModal && editingImage && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>Edit Image Location</h3>
            </div>
            <div className="admin-modal-body">
              <div className="form-group">
                <label>Select State</label>
                <select 
                  value={editingImage.newStateSlug || ''}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="form-control"
                >
                  <option value="">Choose a state</option>
                  {states.map(state => (
                    <option key={state.slug} value={state.slug}>{state.name}</option>
                  ))}
                </select>
              </div>
              {editingImage.newStateSlug && (
                <div className="form-group">
                  <label>Select City</label>
                  <select 
                    value={editingImage.newCitySlug || ''}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Choose a city</option>
                    {cities
                      .filter(city => city.stateSlug === editingImage.newStateSlug)
                      .map(city => (
                        <option key={city.slug} value={city.slug}>{city.name}</option>
                      ))}
                  </select>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button onClick={cancelEditImageLocation} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                onClick={handleMoveImage} 
                className="btn btn-primary"
                disabled={!editingImage.newCitySlug}
              >
                Move Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`admin-message ${notification.type} show`}>
          {notification.message}
        </div>
      )}

      {/* Premium Admin Dashboard Header */}
      <div className="premium-admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div className="admin-title-section">
              <h2>Admin Dashboard</h2>
              <p>Manage content for Discover NorthEast India</p>
            </div>
            <div className="admin-user-actions">
              <div className="user-info">
                <span>Welcome, <strong>Admin</strong></span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading-spinner"></span> Signing Out
                  </>
                ) : (
                  <>
                    <FiLogOut /> Sign Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Stats - Only shown here, removed from dashboard tab */}
      <div className="admin-dashboard-stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏛️</div>
              <div className="stat-info">
                <h3>{stats.states}</h3>
                <p>States</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏙️</div>
              <div className="stat-info">
                <h3>{stats.cities}</h3>
                <p>Cities</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📸</div>
              <div className="stat-info">
                <h3>{stats.images}</h3>
                <p>Images</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💬</div>
              <div className="stat-info">
                <h3>{stats.totalFeedback || stats.feedback}</h3>
                <p>Feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="admin-layout">
          {/* Sidebar Tabs - Fixed at extreme left */}
          <div className="admin-tabs">
              <button
                onClick={() => setActiveTab('states')}
                className={`tab-btn ${activeTab === 'states' ? 'active' : ''}`}
              >
                <FiMap /> Manage States
              </button>
              <button
                onClick={() => setActiveTab('cities')}
                className={`tab-btn ${activeTab === 'cities' ? 'active' : ''}`}
              >
                <FiMap /> Manage Cities
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
              >
                <FiImage /> Moderate Gallery
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
              >
                <FiMessageSquare /> View Feedback
              </button>
            </div>

          {/* Main Content - Takes full remaining width */}
          <div className="admin-main">
            {/* States Tab */}
            {activeTab === 'states' && (
              <div className="tab-content active">
                <h3>Manage States</h3>
                
                <div className="admin-controls">
                  <label>Select State</label>
                  <select
                    onChange={(e) => handleStateSelect(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Choose a state</option>
                    {states.map((state) => (
                      <option key={state.slug} value={state.slug}>{state.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedState && (
                  <div className="edit-form">
                    <h4>Edit {selectedState.name}</h4>
                    <form onSubmit={handleStateFormSubmit}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={selectedState.name}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label>Capital</label>
                          <input
                            type="text"
                            name="capital"
                            defaultValue={selectedState.capital}
                            className="form-control"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          name="description"
                          defaultValue={selectedState.description}
                          rows="4"
                          className="form-control"
                        ></textarea>
                      </div>
                      
                      <div className="form-group">
                        <label>History</label>
                        <textarea
                          name="history"
                          defaultValue={selectedState.history}
                          rows="4"
                          className="form-control"
                        ></textarea>
                      </div>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Languages</label>
                          <input
                            type="text"
                            name="languages"
                            defaultValue={selectedState.languages}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label>Best Time to Visit</label>
                          <input
                            type="text"
                            name="bestTime"
                            defaultValue={selectedState.bestTime}
                            className="form-control"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Highlights (comma separated)</label>
                        <input
                          type="text"
                          name="highlights"
                          defaultValue={selectedState.highlights?.join(', ') || ''}
                          className="form-control"
                        />
                      </div>
                      
                      {/* Add Quick Facts section */}
                      <div className="form-group">
                        <div className="form-header">
                          <label>Quick Facts</label>
                          <button
                            type="button"
                            onClick={addQuickFactField}
                            className="btn btn-secondary btn-small"
                          >
                            Add Quick Fact
                          </button>
                        </div>
                        <div id="quickFactsContainer">
                          {selectedState.quickFacts?.map((fact, index) => (
                            <div key={index} className="form-row">
                              <div className="form-group">
                                <label>Fact Title</label>
                                <input
                                  type="text"
                                  name="quickFactTitle"
                                  defaultValue={fact.title}
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label>Fact Description</label>
                                <input
                                  type="text"
                                  name="quickFactDescription"
                                  defaultValue={fact.description}
                                  className="form-control"
                                />
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-danger btn-small"
                                onClick={(e) => e.target.parentElement.remove()}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <div className="form-header">
                          <label>Festivals</label>
                          <button
                            type="button"
                            onClick={addFestivalField}
                            className="btn btn-secondary btn-small"
                          >
                            Add Festival
                          </button>
                        </div>
                        <div id="festivalsContainer">
                          {selectedState.festivals?.map((festival, index) => (
                            <div key={index} className="form-row">
                              <div className="form-group">
                                <label>Festival Name</label>
                                <input
                                  type="text"
                                  name="festivalName"
                                  defaultValue={festival.name}
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label>Summary</label>
                                <input
                                  type="text"
                                  name="festivalSummary"
                                  defaultValue={festival.summary}
                                  className="form-control"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={() => setSelectedState(null)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                        >
                          Update State
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Cities Tab */}
            {activeTab === 'cities' && (
              <div className="tab-content active">
                <h3>Manage Cities</h3>
                
                <div className="admin-controls">
                  <label>Select City</label>
                  <select
                    onChange={(e) => handleCitySelect(e.target.value)}
                    className="form-control"
                  >
                    <option value="">Choose a city</option>
                    {cities.map((city) => (
                      <option key={city.slug} value={city.slug}>{city.name}</option>
                    ))}
                  </select>
                </div>
                
                {selectedCity && (
                  <div className="edit-form">
                    <h4>Edit {selectedCity.name}</h4>
                    <form onSubmit={handleCityFormSubmit}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={selectedCity.name}
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label>State</label>
                          <input
                            type="text"
                            value={selectedCity.stateSlug}
                            disabled
                            className="form-control"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Summary</label>
                        <textarea
                          name="summary"
                          defaultValue={selectedCity.summary}
                          rows="3"
                          className="form-control"
                        ></textarea>
                      </div>
                      
                      <div className="form-group">
                        <label>History</label>
                        <textarea
                          name="history"
                          defaultValue={selectedCity.history}
                          rows="4"
                          className="form-control"
                        ></textarea>
                      </div>
                      
                      {/* Add Quick Info section */}
                      <div className="form-group">
                        <div className="form-header">
                          <label>Quick Info</label>
                          <button
                            type="button"
                            onClick={addQuickInfoField}
                            className="btn btn-secondary btn-small"
                          >
                            Add Quick Info
                          </button>
                        </div>
                        <div id="quickInfoContainer">
                          {selectedCity.quickInfo?.map((info, index) => (
                            <div key={index} className="form-row">
                              <div className="form-group">
                                <label>Info Title</label>
                                <input
                                  type="text"
                                  name="quickInfoTitle"
                                  defaultValue={info.title}
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label>Info Description</label>
                                <input
                                  type="text"
                                  name="quickInfoDescription"
                                  defaultValue={info.description}
                                  className="form-control"
                                />
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-danger btn-small"
                                onClick={(e) => e.target.parentElement.remove()}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Local Specialties (comma separated)</label>
                        <input
                          type="text"
                          name="localSpecialties"
                          defaultValue={selectedCity.localSpecialties?.join(', ') || ''}
                          className="form-control"
                        />
                      </div>
                      
                      <div className="form-group">
                        <div className="form-header">
                          <label>Explore Items</label>
                          <button
                            type="button"
                            onClick={addExploreItemField}
                            className="btn btn-secondary btn-small"
                          >
                            Add Explore Item
                          </button>
                        </div>
                        <div id="exploreContainer">
                          {selectedCity.explore?.map((item, index) => (
                            <div key={index} className="form-row">
                              <div className="form-group">
                                <label>Explore Title</label>
                                <input
                                  type="text"
                                  name="exploreTitle"
                                  defaultValue={item.title}
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label>Description</label>
                                <input
                                  type="text"
                                  name="exploreDesc"
                                  defaultValue={item.desc}
                                  className="form-control"
                                />
                              </div>
                              <button 
                                type="button" 
                                className="btn btn-danger btn-small"
                                onClick={(e) => e.target.parentElement.remove()}
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="form-actions">
                        <button
                          type="button"
                          onClick={() => setSelectedCity(null)}
                          className="btn btn-secondary"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                        >
                          Update City
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="tab-content active">
                <div className="moderation-header">
                  <h4>Moderate Gallery Images</h4>
                  <div className="moderation-filters">
                    <button 
                      className="btn btn-primary"
                      onClick={handleApproveAllImages}
                    >
                      <FiCheck /> Approve All
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={handleRejectAllImages}
                    >
                      <FiX /> Reject All
                    </button>
                  </div>
                </div>
                
                {pendingImages.length === 0 ? (
                  <div className="empty-state">
                    <FiImage className="empty-icon" />
                    <h4>No Images Pending</h4>
                    <p>All images have been moderated</p>
                  </div>
                ) : (
                  <div className="moderation-grid">
                    {pendingImages.map((image) => (
                      <div key={image.id} className="moderation-item">
                        <img src={image.url} alt="Pending moderation" />
                        <div className="moderation-info">
                          <p>City: {image.cityName}</p>
                          <p>Caption: {image.caption || 'No caption'}</p>
                        </div>
                        <div className="moderation-actions">
                          <button
                            onClick={() => handleImageModeration(image.citySlug, image.id, 'approve')}
                            className="btn btn-success btn-small"
                          >
                            <FiCheck /> Approve
                          </button>
                          <button
                            onClick={() => handleImageModeration(image.citySlug, image.id, 'reject')}
                            className="btn btn-danger btn-small"
                          >
                            <FiX /> Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="moderation-header" style={{ marginTop: '2rem' }}>
                  <h4>Approved Images</h4>
                  <div className="moderation-filters">
                    <button 
                      className="btn btn-danger"
                      onClick={handleDeleteAllApprovedImages}
                    >
                      <FiTrash2 /> Delete All Approved
                    </button>
                  </div>
                </div>
                
                {approvedImages.length === 0 ? (
                  <div className="empty-state">
                    <FiImage className="empty-icon" />
                    <h4>No Approved Images</h4>
                    <p>No images have been approved yet</p>
                  </div>
                ) : (
                  <div className="moderation-grid">
                    {approvedImages.map((image) => (
                      <div key={image.id} className="moderation-item">
                        <div className="moderation-badge approved">Approved</div>
                        <img src={image.url} alt="Approved" />
                        <div className="moderation-info">
                          <p>City: {image.cityName}</p>
                          <p>Caption: {image.caption || 'No caption'}</p>
                        </div>
                        <div className="moderation-actions">
                          <button
                            onClick={() => handleEditImageLocation(image)}
                            className="btn btn-secondary btn-small"
                          >
                            <FiEdit /> Edit Location
                          </button>
                          <button
                            onClick={() => handleDeleteApprovedImage(image.citySlug, image.id)}
                            className="btn btn-danger btn-small"
                          >
                            <FiTrash2 /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feedback Tab */}
            {activeTab === 'feedback' && (
              <div className="tab-content active">
                <div className="feedback-title-container">
                  <h4 className="feedback-title">User Feedback <span className="feedback-count">{stats.feedback}</span></h4>
                  <div className="feedback-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => markAllFeedbackAsRead()}
                    >
                      <FiCheck /> Mark All As Read
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={handleDeleteAllFeedback}
                    >
                      <FiTrash2 /> Delete All
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={() => exportFeedbackToCSV()}
                    >
                      <FiMessageSquare /> Export Feedback
                    </button>
                  </div>
                </div>
                
                {feedback.length === 0 ? (
                  <div className="empty-state">
                    <FiMessageSquare className="empty-icon" />
                    <h4>No Feedback Yet</h4>
                    <p>No feedback received yet</p>
                  </div>
                ) : (
                  <div className="feedback-list">
                    {feedback.map((item, index) => {
                      return (
                        <div key={item.id || index} className={`feedback-item ${item.read ? 'read' : ''}`}>
                          <div className="feedback-header-item">
                            <span className="feedback-author">{item.name}</span>
                            <span className="feedback-date">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="feedback-content-container">
                            <div className="feedback-email">{item.email}</div>
                            <div className="feedback-message">{renderFeedbackMessage(item.message)}</div>
                          </div>
                          <div className="feedback-actions">
                            <button
                              onClick={() => !item.read && markFeedbackAsRead(item.id)}
                              className={`btn ${item.read ? 'btn-secondary' : 'btn-success'}`}
                              disabled={item.read}
                            >
                              <FiCheck /> {item.read ? 'Read' : 'Mark as Read'}
                            </button>
                            <button
                              onClick={() => handleDeleteFeedback(item.id)}
                              className="btn btn-danger"
                            >
                              <FiTrash2 /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="main-footer" id="contact">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Contact Us</h3>
              <p>Email: <a href="mailto:info@discovernortheast.com">info@discovernortheast.com</a></p>
              <p>Phone: +91 98765 43210</p>
              <p>Follow us on social media for updates!</p>
            </div>
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/#states">All States</a></li>
                <li><a href="/admin">Admin Portal</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h3>Explore More</h3>
              <p>Discover the beauty of NorthEast India</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Discover NorthEast. Made with ❤️ for Hackathon</p>
            <p className="footer-disclaimer">This website is for educational purposes only. All images are for demonstration.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}