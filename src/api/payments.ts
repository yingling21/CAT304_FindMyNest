import { supabase } from "@/lib/supabase";
import type { Payment, CreatePaymentParams } from "@/src/types/payment";

export async function createPayment(params: CreatePaymentParams): Promise<Payment> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        rental_id: params.rentalId,
        property_id: params.propertyId,
        tenant_id: userData.user.id,
        landlord_id: params.landlordId,
        payment_type: params.paymentType,
        amount: params.amount,
        monthly_rent: params.monthlyRent,
        security_deposit: params.securityDeposit || 0,
        utilities_deposit: params.utilitiesDeposit || 0,
        payment_status: 'pending',
        due_date: params.dueDate,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      rentalId: data.rental_id,
      propertyId: data.property_id,
      tenantId: data.tenant_id,
      landlordId: data.landlord_id,
      paymentType: data.payment_type,
      amount: data.amount,
      monthlyRent: data.monthly_rent,
      securityDeposit: data.security_deposit,
      utilitiesDeposit: data.utilities_deposit,
      razorpayOrderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
      razorpaySignature: data.razorpay_signature,
      paymentStatus: data.payment_status,
      paymentMethod: data.payment_method,
      paymentDate: data.payment_date,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Failed to create payment:', error);
    throw error;
  }
}

export async function updatePaymentStatus(
  paymentId: string,
  status: 'success' | 'failed',
  razorpayPaymentId?: string,
  razorpaySignature?: string,
  paymentMethod?: string
): Promise<void> {
  try {
    const updateData: any = {
      payment_status: status,
      payment_date: status === 'success' ? new Date().toISOString() : undefined,
    };

    if (razorpayPaymentId) {
      updateData.razorpay_payment_id = razorpayPaymentId;
    }
    if (razorpaySignature) {
      updateData.razorpay_signature = razorpaySignature;
    }
    if (paymentMethod) {
      updateData.payment_method = paymentMethod;
    }

    const { error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId);

    if (error) throw error;
  } catch (error) {
    console.error('Failed to update payment status:', error);
    throw error;
  }
}

export async function getPaymentsByRental(rentalId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('rental_id', rentalId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((payment: any) => ({
      id: payment.id,
      rentalId: payment.rental_id,
      propertyId: payment.property_id,
      tenantId: payment.tenant_id,
      landlordId: payment.landlord_id,
      paymentType: payment.payment_type,
      amount: payment.amount,
      monthlyRent: payment.monthly_rent,
      securityDeposit: payment.security_deposit,
      utilitiesDeposit: payment.utilities_deposit,
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      razorpaySignature: payment.razorpay_signature,
      paymentStatus: payment.payment_status,
      paymentMethod: payment.payment_method,
      paymentDate: payment.payment_date,
      dueDate: payment.due_date,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    }));
  } catch (error) {
    console.error('Failed to get payments:', error);
    throw error;
  }
}

export async function getPaymentsByTenant(tenantId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((payment: any) => ({
      id: payment.id,
      rentalId: payment.rental_id,
      propertyId: payment.property_id,
      tenantId: payment.tenant_id,
      landlordId: payment.landlord_id,
      paymentType: payment.payment_type,
      amount: payment.amount,
      monthlyRent: payment.monthly_rent,
      securityDeposit: payment.security_deposit,
      utilitiesDeposit: payment.utilities_deposit,
      razorpayOrderId: payment.razorpay_order_id,
      razorpayPaymentId: payment.razorpay_payment_id,
      razorpaySignature: payment.razorpay_signature,
      paymentStatus: payment.payment_status,
      paymentMethod: payment.payment_method,
      paymentDate: payment.payment_date,
      dueDate: payment.due_date,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
    }));
  } catch (error) {
    console.error('Failed to get payments:', error);
    throw error;
  }
}

export async function createRazorpayOrder(amount: number, receipt: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_RORK_API_BASE_URL || ''}/api/razorpay/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: 'MYR',
        receipt,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Failed to create Razorpay order:', error);
    throw error;
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string
): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_RORK_API_BASE_URL || ''}/api/razorpay/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        paymentId,
        signature,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();
    return data.verified === true;
  } catch (error) {
    console.error('Failed to verify payment:', error);
    return false;
  }
}
