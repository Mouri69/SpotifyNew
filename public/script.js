const fetchRecommendations = async () => {
    try {
        const response = await fetch('/callback');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const recommendations = await response.json();
        console.log('Fetched recommendations:', recommendations); // Debugging line
        displayRecommendations(recommendations);
    } catch (error) {
        console.error('Error fetching recommendations:', error);
    }
};
