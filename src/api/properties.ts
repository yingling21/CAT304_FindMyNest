import { supabase } from '@/lib/supabase';
import type { Property, PropertyInput, PropertyInsert } from '@/src/types/property';
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
  (photosResult.data || []).forEach((photo) => {
    const propId = photo.property_id;
    if (!photosByProperty[propId]) photosByProperty[propId] = [];
    photosByProperty[propId].push({
      id: photo.Photo_id.toString(),
      url: photo.photo_URL,
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
    .eq('rentalStatus', true)
    .order('created_At', { ascending: false });

  if (error) {
    console.error('Failed to fetch properties:', error);
    throw error;
  }

  const enrichedData = await enrichPropertiesWithData(data || []);
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

export async function getPropertiesByLandlord(landlordId: string): Promise<Property[]> {
  const { data, error } = await supabase
    .from('property')
    .select('*')
    .eq('landlord_id', landlordId)
    .order('created_At', { ascending: false });

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
      description: propertyData.description,
      latitude: propertyData.latitude,
      longitude: propertyData.longitude,
      address: propertyData.address,
      size: propertyData.size,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      furnishingLevel: propertyData.furnishingLevel,
      monthlyRent: propertyData.monthlyRent,
      securityDeposit: propertyData.securityDeposit,
      utilitiesDeposit: propertyData.utilitiesDeposit,
      minimumRentalPeriod: propertyData.minimumRentalPeriod,
      moveInDate: propertyData.moveInDate,
      rentalStatus: propertyData.rentalStatus !== false,
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
      .from("property_photo")
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
      description: propertyData.description,
      address: propertyData.address,
      size: propertyData.size,
      bedrooms: propertyData.bedrooms,
      bathrooms: propertyData.bathrooms,
      furnishingLevel: propertyData.furnishingLevel,
      monthlyRent: propertyData.monthlyRent,
      securityDeposit: propertyData.securityDeposit,
      utilitiesDeposit: propertyData.utilitiesDeposit,
      minimumRentalPeriod: propertyData.minimumRentalPeriod,
      moveInDate: propertyData.moveInDate,
      rentalStatus: propertyData.rentalStatus !== false,
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
        photo_URL: typeof photo === 'string' ? photo : photo.url,
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
