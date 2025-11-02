export interface Collection {
  id: string;
  nameKey: string; // Key for translation
  descriptionKey: string; // Key for translation
  image: string;
  itemCount: number;
}

export const allCollections: Collection[] = [
  {
    id: '1',
    nameKey: 'cyberAccessories',
    descriptionKey: 'cyberAccessories',
    image: '/assets/collections/cyber.jpeg',
    itemCount: 0
  },
  {
    id: '2',
    nameKey: 'solarpunkItems',
    descriptionKey: 'solarpunkItems',
    image: '/assets/collections/solarpunk.jpeg',
    itemCount: 0
  },
  {
    id: '3',
    nameKey: 'pureCrypto',
    descriptionKey: 'pureCrypto',
    image: '/assets/collections/pure-crypto.jpeg',
    itemCount: 0
  }
];

// Helper functions to get specific collection subsets
export const getFeaturedCollections = (): Collection[] => {
  return allCollections; // Return all collections since we removed isFeatured
};

export const getCollectionById = (id: string): Collection | undefined => {
  return allCollections.find(collection => collection.id === id);
};

export const getCollectionsByCreator = (creator: string): Collection[] => {
  return allCollections; // Return all collections since we removed creator
};
