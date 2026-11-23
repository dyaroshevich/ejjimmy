const testApi = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/test', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Success response:', data);
  } catch (error) {
    console.error('Fetch error:', error.message);
  }
};

testApi();