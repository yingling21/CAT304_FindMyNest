import { supabase } from '@/lib/supabase';
import type { Property, PropertyInput, roomType, PropertyInsert } from '@/src/types/property';
import { normalizeProperty, normalizeProperties } from '@/src/utils/normalizeProperty';

async function enrichPropertiesWithData(properties: any[]): Promise<any[]> {
  if (properties.length === 0) return [];

  const propertyIds = properties.map(p => p.property_id);
  const landlordIds = properties.map(p => p.landlord_id).filter(Boolean);

  const [photosResult, landlordResult, reviewsResult] = await Promise.all([
    supabase
      .from('property_Photo')
      .select('*')
      .in('property_id', propertyIds),
    
    landlordIds.length > 0 ? supabase
      .from('users')
      .select('id, full_name, avatar_url, verification_status')
      .in('id', landlordIds) : Promise.resolve({ data: [] }),
    
    supabase
      .from('reviews')
      .select('property_id, rating')
      .in('property_id', propertyIds)
  ]);

  const photosByProperty: Record<string, any[]> = {};
  (photosResult.data || []).forEach((photo, index) => {
    const propId = photo.property_id;
    if (!photosByProperty[propId]) photosByProperty[propId] = [];
    
    // Handle different possible column names for photo ID
    const photoId = photo.Photo_id ?? photo.photo_id ?? photo.id ?? `${propId}-${index}`;
    
    photosByProperty[propId].push({
      id: typeof photoId === 'string' ? photoId : photoId.toString(),
      url: photo.photo_url,
      isCover: photo.is_cover,
    });
  });

  const landlordMap: Record<string, any> = {};
  (landlordResult.data || []).forEach((landlord: any) => {
    landlordMap[landlord.id] = {
      name: landlord.full_name || 'Unknown',
      photo: landlord.avatar_url,
      verified: landlord.verification_status === 'approved',
    };
  });

  const reviewsByProperty: Record<string, number[]> = {};
  (reviewsResult.data || []).forEach((review) => {
    const propId = review.property_id;
    if (!reviewsByProperty[propId]) reviewsByProperty[propId] = [];
    reviewsByProperty[propId].push(Number(review.rating));
  });

  return properties.map(property => {
    const propId = property.property_id;
    const landlordId = property.landlord_id;
    const landlordData = landlordId ? landlordMap[landlordId] : null;
    const reviews = reviewsByProperty[propId] || [];
    const avgRating = reviews.length > 0 
      ? reviews.reduce((a, b) => a + b, 0) / reviews.length 
      : 0;

    return {
      ...property,
      photos: photosByProperty[propId] || [],
      landlord_name: landlordData?.name || 'Unknown',
      landlord_photo: landlordData?.photo,
      landlord_verified: landlordData?.verified || false,
      average_rating: avgRating,
      total_reviews: reviews.length,
    };
  });
}

export async function getAvailableProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('property')
    .select('*')
    .eq('approvalStatus', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch properties:', error);
    throw error;
  }

  const enrichedData = await enrichPropertiesWithData(data || []);
  return normalizeProperties(enrichedData);
}

export type PropertyFilters = {
  location?: string;
  propertyTypes?: string[];
  priceMin?: number;
  priceMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string[];
  amenities?: {
    airConditioning?: boolean;
    wifi?: boolean;
    parking?: boolean;
    kitchenAccess?: boolean;
    washingMachine?: boolean;
    security?: boolean;
  };
  searchQuery?: string;
};

export async function getFilteredProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  let query = supabase
    .from('property')
    .select('*')
    .eq('approvalStatus', 'approved');
  // Filter by location (address contains location string)
  if (filters.location) {
    query = query.ilike('address', `%${filters.location}%`);
  }
  // Filter by property types
  if (filters.propertyTypes && filters.propertyTypes.length > 0) {
    query = query.in('propertyType', filters.propertyTypes);
  }
  // Filter by price range
  if (filters.priceMin !== undefined) {
    query = query.gte('monthlyRent', filters.priceMin);
  }
  if (filters.priceMax !== undefined) {
    query = query.lte('monthlyRent', filters.priceMax);
  }
  // Filter by size range
  if (filters.sizeMin !== undefined) {
    query = query.gte('size', filters.sizeMin);
  }
  if (filters.sizeMax !== undefined) {
    query = query.lte('size', filters.sizeMax);
  }
  // Filter by bedrooms
  if (filters.bedrooms !== undefined && filters.bedrooms !== null) {
    query = query.gte('bedrooms', filters.bedrooms);
  }
  // Filter by bathrooms
  if (filters.bathrooms !== undefined && filters.bathrooms !== null) {
    query = query.gte('bathrooms', filters.bathrooms);
  }
  // Filter by furnishing level
  if (filters.furnishing && filters.furnishing.length > 0) {
    query = query.in('furnishingLevel', filters.furnishing);
  }
  // Order by created_at
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;
  if (error) {
    console.error('Failed to fetch filtered properties:', error);
    throw error;
  }
  // Filter by amenities and search query in memory (since Supabase JSONB filtering can be complex)
  let filteredData = data || [];
  // Filter by amenities (stored as JSONB)
  if (filters.amenities) {
    filteredData = filteredData.filter((property: any) => {
      const amenities = property.amenities || {};
      if (filters.amenities?.airConditioning && !amenities.airConditioning) return false;
      if (filters.amenities?.wifi && !amenities.wifi) return false;
      if (filters.amenities?.parking && !amenities.parking) return false;
      if (filters.amenities?.kitchenAccess && !amenities.kitchenAccess) return false;
      if (filters.amenities?.washingMachine && !amenities.washingMachine) return false;
      if (filters.amenities?.security && !amenities.security) return false;
      return true;
    });
  }

  // Filter by search query (address or description)
  if (filters.searchQuery) {
    const searchLower = filters.searchQuery.toLowerCase();
    filteredData = filteredData.filter((property: any) => {
      const address = (property.address || '').toLowerCase();
      const description = (property.description || '').toLowerCase();
      return address.includes(searchLower) || description.includes(searchLower);
    });
  }
  // Filter by availableDate (within one month)
  const today = new Date();
  const oneMonthFromNow = new Date();
  oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
  filteredData = filteredData.filter((property: any) => {
    if (!property.availableDate) return true;
    try {
      const availableDate = new Date(property.availableDate);
      return availableDate <= oneMonthFromNow;
    } catch {
      return true;
    }
  });

  const enrichedData = await enrichPropertiesWithData(filteredData);
  return normalizeProperties(enrichedData);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from('property')
    .select('*')
    .eq('property_id', id)
    .single();

  if (error) {
    console.error('Failed to fetch property:', error);
    throw error;
  }

  if (!data) return null;

  const enrichedData = await enrichPropertiesWithData([data]);
  return enrichedData.length > 0 ? normalizeProperty(enrichedData[0]) : null;
}

export async function getPropertiesByIds(
  ids: string[]
): Promise<Property[]> {
  if (ids.length === 0) return [];

  const { data, error } = await supabase
    .from("property")
    .select("*")
    .in("property_id", ids);

  if (error) {
    console.error("Failed to fetch favorite properties:", error);
    throw error;
  }

  const enrichedData = await enrichPropertiesWithData(data || []);
  return normalizeProperties(enrichedData);
}

export async function getPropertiesByLandlord(landlordId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('property')
    .select('*')
    .eq('landlord_id', landlordId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch landlord properties:', error);
    throw error;
  }

  const enrichedData = await enrichPropertiesWithData(data || []);
  return normalizeProperties(enrichedData);
}

export async function createProperty(propertyData: Partial<PropertyInput>): Promise<Property> {
  const { data, error } = await supabase
    .from("property")
    .insert({
      landlord_id: propertyData.landlord_id,
      propertyType: propertyData.propertyType,
      title: propertyData.title,
      description: propertyData.description,
      latitude: propertyData.latitude,
      longitude: propertyData.longitude,
      address: propertyData.address,
      size: propertyData.size,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      roomType: propertyData.roomType, // ADD THIS
      floorLevel: propertyData.floorLevel, // ADD THIS
      furnishingLevel: propertyData.furnishingLevel,
      monthlyRent: propertyData.monthlyRent,
      securityDeposit: propertyData.securityDeposit,
      utilitiesDeposit: propertyData.utilitiesDeposit,
      minimumRentalPeriod: propertyData.minimumRentalPeriod,
      availableDate: propertyData.availableDate,
      approvalStatus: propertyData.approvalStatus || 'pending',
      amenities: propertyData.amenities || {},
      houseRules: propertyData.houseRules || {},
    })
    .select()
    .single();

  if (error) throw error;

  if (propertyData.photos?.length) {
    const photoInserts = propertyData.photos.map((photo, index) => ({
      property_id: data.property_id,
      photo_url: typeof photo === "string" ? photo : photo.url,
      is_cover: index === 0,
    }));

    const { error: photoError } = await supabase
      .from("property_Photo")
      .insert(photoInserts);

    if (photoError) throw photoError;
  }

  const enrichedData = await enrichPropertiesWithData([data]);
  return normalizeProperty(enrichedData[0]);
}


export async function updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
  const { data, error } = await supabase
    .from('property')
    .update({
      propertyType: propertyData.propertyType,
      title: propertyData.title,
      description: propertyData.description,
      address: propertyData.address,
      size: propertyData.size,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      roomType: propertyData.roomType,
      floorLevel: propertyData.floorLevel, 
      furnishingLevel: propertyData.furnishingLevel,
      monthlyRent: propertyData.monthlyRent,
      securityDeposit: propertyData.securityDeposit,
      utilitiesDeposit: propertyData.utilitiesDeposit,
      minimumRentalPeriod: propertyData.minimumRentalPeriod,
      availableDate: propertyData.availableDate,
      approvalStatus: propertyData.approvalStatus,
      amenities: propertyData.amenities,
      houseRules: propertyData.houseRules,
    })
    .eq('property_id', id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update property:', error);
    throw error;
  }

  if (propertyData.photos) {
    await supabase
      .from('property_Photo')
      .delete()
      .eq('property_id', id);

    if (propertyData.photos.length > 0) {
      const photoInserts = propertyData.photos.map((photo, index) => ({
        property_id: data.property_id,
        photo_url: typeof photo === 'string' ? photo : photo.url,
        is_cover: index === 0,
      }));

      const { error: photoError } = await supabase
        .from('property_Photo')
        .insert(photoInserts);

      if (photoError) {
        console.error('Failed to insert photos:', photoError);
      }
    }
  }

  const enrichedData = await enrichPropertiesWithData([data]);
  return normalizeProperty(enrichedData[0]);
}

export async function deleteProperty(id: string): Promise<void> {
  const { error } = await supabase
    .from('property')
    .delete()
    .eq('property_id', id);

  if (error) {
    console.error('Failed to delete property:', error);
    throw error;
  }
}
