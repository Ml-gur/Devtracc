// Simple wrapper for the unsplash_tool function
// This provides a consistent interface for image fetching across the application

export const unsplash_tool = async (query: string): Promise<string | null> => {
  try {
    // In a real implementation, this would call the actual unsplash_tool
    // For now, we'll return placeholder images based on the query
    const categoryImages: { [key: string]: string } = {
      'web-app development project': 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop&auto=format',
      'mobile-app development project': 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&auto=format',
      'api development project': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=600&fit=crop&auto=format',
      'library development project': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format',
      'game development project': 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop&auto=format',
      'ai-ml development project': 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop&auto=format',
      'blockchain development project': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop&auto=format',
      'other development project': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&auto=format'
    };

    // Return appropriate image based on query
    const imageUrl = categoryImages[query.toLowerCase()] || categoryImages['other development project'];
    
    return imageUrl;
  } catch (error) {
    console.warn('Failed to fetch image from unsplash:', error);
    return null;
  }
};

// Export default for convenience
export default unsplash_tool;