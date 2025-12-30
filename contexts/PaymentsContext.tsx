import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Payment } from "@/src/types/payment";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getPaymentsByTenant, 
  getPaymentsByRental,
  createPayment as createPaymentAPI,
  updatePaymentStatus as updatePaymentStatusAPI,
  createRazorpayOrder,
} from "@/src/api/payments";
import { Linking, Platform } from "react-native";

export const [PaymentsProvider, usePayments] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!user) {
        setPayments([]);
        return;
      }
      
      const data = await getPaymentsByTenant(user.id);
      setPayments(data);
    } catch (error) {
      console.error("Failed to load payments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const createPayment = async (
    rentalId: string,
    propertyId: string,
    landlordId: string,
    paymentType: "initial" | "recurring",
    amount: number,
    monthlyRent: number,
    securityDeposit?: number,
    utilitiesDeposit?: number,
    dueDate?: string
  ): Promise<Payment> => {
    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const payment = await createPaymentAPI({
        rentalId,
        propertyId,
        landlordId,
        paymentType,
        amount,
        monthlyRent,
        securityDeposit,
        utilitiesDeposit,
        dueDate,
      });

      setPayments(prev => [payment, ...prev]);
      return payment;
    } catch (error) {
      console.error("Failed to create payment:", error);
      throw error;
    }
  };

  const initiateRazorpayPayment = async (
    paymentId: string,
    amount: number,
    description: string
  ): Promise<void> => {
    try {
      const orderId = await createRazorpayOrder(amount, paymentId);

      const razorpayKey = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay key not configured");
      }

      if (Platform.OS === 'web') {
        const options = {
          key: razorpayKey,
          amount: Math.round(amount * 100),
          currency: 'MYR',
          name: 'Property Rental',
          description,
          order_id: orderId,
          handler: async function (response: any) {
            try {
              await updatePaymentStatusAPI(
                paymentId,
                'success',
                response.razorpay_payment_id,
                response.razorpay_signature,
                'razorpay'
              );
              await loadPayments();
            } catch (error) {
              console.error('Payment update failed:', error);
            }
          },
          prefill: {
            name: user?.fullName || '',
            email: user?.email || '',
            contact: user?.phoneNumber || '',
          },
          theme: {
            color: '#6366F1',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', async function (response: any) {
          await updatePaymentStatusAPI(paymentId, 'failed');
          await loadPayments();
        });
        rzp.open();
      } else {
        const paymentUrl = `https://api.razorpay.com/v1/checkout/embedded?key_id=${razorpayKey}&order_id=${orderId}&amount=${Math.round(amount * 100)}&currency=MYR&name=Property%20Rental&description=${encodeURIComponent(description)}`;
        
        await Linking.openURL(paymentUrl);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        await loadPayments();
      }
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      throw error;
    }
  };

  const updatePaymentStatus = async (
    paymentId: string,
    status: 'success' | 'failed',
    razorpayPaymentId?: string,
    razorpaySignature?: string,
    paymentMethod?: string
  ): Promise<void> => {
    try {
      await updatePaymentStatusAPI(
        paymentId,
        status,
        razorpayPaymentId,
        razorpaySignature,
        paymentMethod
      );

      setPayments(prev => prev.map(payment =>
        payment.id === paymentId
          ? { 
              ...payment, 
              paymentStatus: status,
              paymentDate: status === 'success' ? new Date().toISOString() : payment.paymentDate,
              razorpayPaymentId,
              razorpaySignature,
              paymentMethod,
            }
          : payment
      ));
    } catch (error) {
      console.error("Failed to update payment status:", error);
      throw error;
    }
  };

  const getPaymentsByRentalId = async (rentalId: string): Promise<Payment[]> => {
    try {
      return await getPaymentsByRental(rentalId);
    } catch (error) {
      console.error("Failed to get rental payments:", error);
      return [];
    }
  };

  const getNextPaymentDueDate = (rentalId: string): string | null => {
    const rentalPayments = payments.filter(p => p.rentalId === rentalId);
    const lastSuccessfulPayment = rentalPayments
      .filter(p => p.paymentStatus === 'success')
      .sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime())[0];

    if (!lastSuccessfulPayment) return null;

    const nextDue = new Date(lastSuccessfulPayment.paymentDate!);
    nextDue.setMonth(nextDue.getMonth() + 1);
    return nextDue.toISOString();
  };

  const hasUnpaidPayments = (rentalId: string): boolean => {
    return payments.some(p => p.rentalId === rentalId && p.paymentStatus === 'pending');
  };

  return {
    payments,
    isLoading,
    createPayment,
    initiateRazorpayPayment,
    updatePaymentStatus,
    getPaymentsByRentalId,
    getNextPaymentDueDate,
    hasUnpaidPayments,
    loadPayments,
  };
});
