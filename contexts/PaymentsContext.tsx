import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Payment } from "@/src/types/payment";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getPaymentsByTenant, 
  getPaymentsByRental,
  createPayment as createPaymentAPI,
  updatePaymentStatus as updatePaymentStatusAPI,
  createStripePaymentIntent,
} from "@/src/api/payments";
import { Platform, Alert } from "react-native";
import { useStripe } from '@stripe/stripe-react-native';

export const [PaymentsProvider, usePayments] = createContextHook(() => {
  const auth = useAuth();
  const user = auth?.user ?? null;
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const stripe = Platform.OS !== 'web' ? useStripe() : null;

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

  const initiateStripePayment = async (
    paymentId: string,
    amount: number,
    description: string
  ): Promise<void> => {
    try {
      const { clientSecret } = await createStripePaymentIntent(
        amount,
        paymentId,
        user?.email
      );

      if (Platform.OS === 'web') {
        const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
        if (!stripePublishableKey) {
          throw new Error("Stripe key not configured");
        }

        const stripeCheckoutUrl = `${process.env.EXPO_PUBLIC_RORK_API_BASE_URL || ''}/api/stripe/checkout?clientSecret=${clientSecret}&paymentId=${paymentId}`;
        
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        const popup = window.open(
          stripeCheckoutUrl,
          'stripe-checkout',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        const checkPaymentStatus = setInterval(async () => {
          if (popup?.closed) {
            clearInterval(checkPaymentStatus);
            await loadPayments();
          }
        }, 1000);
      } else {
        if (!stripe) {
          throw new Error('Stripe not initialized');
        }

        const { error, paymentIntent } = await stripe.confirmPayment(clientSecret, {
          paymentMethodType: 'Card',
        });

        if (error) {
          console.error('Payment failed:', error);
          await updatePaymentStatusAPI(paymentId, 'failed');
          Alert.alert('Payment Failed', error.message);
        } else if (paymentIntent) {
          await updatePaymentStatusAPI(
            paymentId,
            'success',
            paymentIntent.id,
            'card'
          );
          Alert.alert('Success', 'Payment completed successfully!');
        }
        
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
    stripePaymentIntentId?: string,
    paymentMethod?: string
  ): Promise<void> => {
    try {
      await updatePaymentStatusAPI(
        paymentId,
        status,
        stripePaymentIntentId,
        paymentMethod
      );

      setPayments(prev => prev.map(payment =>
        payment.id === paymentId
          ? { 
              ...payment, 
              paymentStatus: status,
              paymentDate: status === 'success' ? new Date().toISOString() : payment.paymentDate,
              stripePaymentIntentId,
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
    initiateStripePayment,
    updatePaymentStatus,
    getPaymentsByRentalId,
    getNextPaymentDueDate,
    hasUnpaidPayments,
    loadPayments,
  };
});
