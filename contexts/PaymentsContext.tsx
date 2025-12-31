import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import type { Payment } from "@/src/types/payment";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getPaymentsByTenant, 
  getPaymentsByRental,
  createPayment as createPaymentAPI,
  updatePaymentStatus as updatePaymentStatusAPI,
} from "@/src/api/payments";
import { Alert } from "react-native";

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

  const completePayment = async (
    paymentId: string,
    paymentMethod: 'fpx' | 'card' | 'ewallet'
  ): Promise<void> => {
    try {
      await updatePaymentStatusAPI(
        paymentId,
        'success',
        undefined,
        paymentMethod
      );

      setPayments(prev => prev.map(payment =>
        payment.id === paymentId
          ? { 
              ...payment, 
              paymentStatus: 'success',
              paymentDate: new Date().toISOString(),
              paymentMethod,
            }
          : payment
      ));

      Alert.alert('Success', 'Payment recorded successfully!');
    } catch (error) {
      console.error("Failed to complete payment:", error);
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
    completePayment,
    updatePaymentStatus,
    getPaymentsByRentalId,
    getNextPaymentDueDate,
    hasUnpaidPayments,
    loadPayments,
  };
});
