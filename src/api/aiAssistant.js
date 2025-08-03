const API_BASE_URL = 'https://www.samethome.com';

// 🤖 Obtenir tous les insights IA
export const getAIInsights = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/api/logiciel/ai/insights`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des insights IA');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    throw error;
  }
};

// 📊 Analyser les produits les plus demandés
export const getTopProducts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/api/logiciel/ai/products`);
    if (!response.ok) {
      throw new Error('Erreur lors de l\'analyse des produits');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

// 🏢 Analyser les clients par région
export const getRegionAnalysis = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/api/logiciel/ai/regions`);
    if (!response.ok) {
      throw new Error('Erreur lors de l\'analyse géographique');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching region analysis:', error);
    throw error;
  }
};

// 🎯 Obtenir les prédictions
export const getPredictions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/api/logiciel/ai/predictions`);
    if (!response.ok) {
      throw new Error('Erreur lors de la génération des prédictions');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching predictions:', error);
    throw error;
  }
};

// 📈 Analyser les performances de vente
export const getSalesPerformance = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/api/logiciel/ai/performance`);
    if (!response.ok) {
      throw new Error('Erreur lors de l\'analyse des performances');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching sales performance:', error);
    throw error;
  }
};
