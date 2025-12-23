import { supabase } from '@/lib/supabase';
import type { Property } from '@/src/types/property';
import { normalizeProperty, normalizeProperties } from '@/src/utils/normalizeProperty';

async function enrichPropertiesWithData(properties: any[]): Promise<any[]> {
  if (properties.length === 0) return [];

  const propertyIds = properties.map(p => p.property_id);

  const [photosResult, landlordResult, reviewsResult] = await Promise.all([
    supabase
      .from('property_Photo')
      .select('*')
      .in('property_id', propertyIds),
    
    supabase
      .from('landlord')
      .select('id, user_id, users!inner(full_name, avatar_url, verification_status)')
      .in('id', properties.map(p => p.landlord_id).filter(Boolean)),
    
    supabase
      .from('reviews')
      .select('property_id, rating')
      .in('property_id', propertyIds)
  ]);

  const photosByProperty: Record<string, any[]> = {};
  (photosResult.data || []).forEach((photo) => {
    const propId = photo.property_id.toString();
    if (!photosByProperty[propId]) photosByProperty[propId] = [];
    photosByProperty[propId].push({
      id: photo.Photo_id.toString(),
      url: photo.photo_URL,
      isCover: photo.is_cover,
    });
  });

  const landlordMap: Record<string, any> = {};
  (landlordResult.data || []).forEach((landlord: any) => {
    landlordMap[landlord.id.toString()] = {
      name: landlord.users?.full_name || 'Unknown',
      photo: landlord.users?.avatar_url,
      verified: landlord.users?.verification_status === 'approved',
    };
  });

  const reviewsByProperty: Record<string, number[]> = {};
  (reviewsResult.data || []).forEach((review) => {
    const propId = review.property_id.toString();
    if (!reviewsByProperty[propId]) reviewsByProperty[propId] = [];
    reviewsByProperty[propId].push(Number(review.rating));
  });

  return properties.map(property => {
    const propId = property.property_id.toString();
    const landlordId = property.landlord_id?.toString();
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
    .from('listing')
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
    .from('listing')
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
  const { data: landlordData, error: landlordError } = await supabase
    .from('landlord')
    .select('id')
    .eq('user_id', landlordId)
    .single();

  if (landlordError || !landlordData) {
    console.error('Failed to fetch landlord:', landlordError);
    return [];
  }

  const { data, error } = await supabase
    .from('listing')
    .select('*')
    .eq('landlord_id', landlordData.id)
    .order('created_At', { ascending: false });

  if (error) {
    console.error('Failed to fetch landlord properties:', error);
    throw error;
  }

  const enrichedData = await enrichPropertiesWithData(data || []);
  return normalizeProperties(enrichedData);
}

export async function createProperty(propertyData: Partial<Property>): Promise<Property> {
  const { data: landlordData } = await supabase
    .from('landlord')
    .select('id')
    .eq('user_id', propertyData.landlordId)
    .single();

  if (!landlordData) {
    throw new Error('Landlord not found');
  }

  const { data, error } = await supabase
    .from('listing')
    .insert({
      landlord_id: landlordData.id,
      propertyType: propertyData.propertyType,
      title: propertyData.title,
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
      amenities: propertyData.amenities || {},
      houseRules: propertyData.houseRules || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create property:', error);
    throw error;
  }

  if (propertyData.photos && propertyData.photos.length > 0) {
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

  const enrichedData = await enrichPropertiesWithData([data]);
  return normalizeProperty(enrichedData[0]);
}

export async function updateProperty(id: string, propertyData: Partial<Property>): Promise<Property> {
  const { data, error } = await supabase
    .from('listing')
    .update({
      propertyType: propertyData.propertyType,
      title: propertyData.title,
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
    .from('listing')
    .delete()
    .eq('property_id', id);

  if (error) {
    console.error('Failed to delete property:', error);
    throw error;
  }
}
