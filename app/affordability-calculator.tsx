import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { X, Calculator, TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import Slider from "@react-native-community/slider";
import { styles } from "@/styles/calculator";

type AffordabilityCalculatorProps = {
  visible: boolean;
  onClose: () => void;
};

export default function AffordabilityCalculator({ visible, onClose }: AffordabilityCalculatorProps) {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [savingsGoal, setSavingsGoal] = useState(20);

  const income = parseFloat(monthlyIncome) || 0;
  const expenses = parseFloat(monthlyExpenses) || 0;
  const savings = (income * savingsGoal) / 100;
  const disposableIncome = income - expenses - savings;

  const comfortableRent = disposableIncome * 0.2;
  const recommendedRent = disposableIncome * 0.25;
  const maximumRent = disposableIncome * 0.3;

  const affordabilityLevel =
    disposableIncome < 500 ? "low" : disposableIncome < 1500 ? "moderate" : "good";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Calculator size={24} color="#6366F1" />
            <Text style={styles.headerTitle}>Affordability Calculator</Text>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6B7280" />
          </Pressable>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <Text style={styles.description}>
            Calculate how much rent you can comfortably afford based on your monthly income and
            expenses.
          </Text>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Monthly Income (RM)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5000"
              keyboardType="numeric"
              value={monthlyIncome}
              onChangeText={setMonthlyIncome}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.label}>Monthly Expenses (RM) <Text style={styles.hint}>(food, transport, bills, etc.)</Text></Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 1500"
              keyboardType="numeric"
              value={monthlyExpenses}
              onChangeText={setMonthlyExpenses}
            />
          </View>

          <View style={styles.inputSection}>
            <View style={styles.sliderHeader}>
              <Text style={styles.label}>Savings Goal (%)</Text>
              <Text style={styles.sliderValue}>{savingsGoal}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={50}
              step={5}
              value={savingsGoal}
              onValueChange={setSavingsGoal}
              minimumTrackTintColor="#6366F1"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#6366F1"
            />
          </View>

          {income > 0 && expenses > 0 && (
            <>
              <View style={styles.breakdownSection}>
                <Text style={styles.sectionTitle}>Monthly Breakdown</Text>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>Income</Text>
                  <Text style={styles.breakdownValue}>RM {income.toFixed(0)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>- Expenses</Text>
                  <Text style={styles.breakdownValue}>RM {expenses.toFixed(0)}</Text>
                </View>
                <View style={styles.breakdownRow}>
                  <Text style={styles.breakdownLabel}>- Savings ({savingsGoal}%)</Text>
                  <Text style={styles.breakdownValue}>RM {savings.toFixed(0)}</Text>
                </View>
                <View style={[styles.breakdownRow, styles.breakdownTotal]}>
                  <Text style={styles.breakdownTotalLabel}>Disposable Income</Text>
                  <Text style={styles.breakdownTotalValue}>RM {disposableIncome.toFixed(0)}</Text>
                </View>
              </View>

              <View style={[
                styles.affordabilityBadge,
                affordabilityLevel === "low" && styles.affordabilityLow,
                affordabilityLevel === "moderate" && styles.affordabilityModerate,
                affordabilityLevel === "good" && styles.affordabilityGood,
              ]}>
                {affordabilityLevel === "low" && <TrendingDown size={20} color="#EF4444" />}
                {affordabilityLevel === "moderate" && <Minus size={20} color="#F59E0B" />}
                {affordabilityLevel === "good" && <TrendingUp size={20} color="#10B981" />}
                <Text style={styles.affordabilityText}>
                  Affordability Level: {affordabilityLevel === "low" && "Low - Consider roommates or cheaper areas"}
                  {affordabilityLevel === "moderate" && "Moderate - Budget carefully"}
                  {affordabilityLevel === "good" && "Good - Comfortable budget"}
                </Text>
              </View>

              <View style={styles.recommendationsSection}>
                <Text style={styles.sectionTitle}>Rent Recommendations</Text>

                <View style={[styles.recommendationCard, styles.comfortableCard]}>
                  <Text style={styles.recommendationTitle}>Comfortable Range</Text>
                  <Text style={styles.recommendationAmount}>RM {comfortableRent.toFixed(0)}</Text>
                  <Text style={styles.recommendationDesc}>20% of disposable income</Text>
                  <Text style={styles.recommendationNote}>Best for long-term financial health</Text>
                </View>

                <View style={[styles.recommendationCard, styles.recommendedCard]}>
                  <Text style={styles.recommendationTitle}>Recommended Range</Text>
                  <Text style={styles.recommendationAmount}>RM {recommendedRent.toFixed(0)}</Text>
                  <Text style={styles.recommendationDesc}>25% of disposable income</Text>
                  <Text style={styles.recommendationNote}>Balanced approach to affordability</Text>
                </View>

                <View style={[styles.recommendationCard, styles.maximumCard]}>
                  <Text style={styles.recommendationTitle}>Maximum Range</Text>
                  <Text style={styles.recommendationAmount}>RM {maximumRent.toFixed(0)}</Text>
                  <Text style={styles.recommendationDesc}>30% of disposable income</Text>
                  <Text style={styles.recommendationNote}>Upper limit - may feel tight financially</Text>
                </View>
              </View>

              <View style={styles.tipsSection}>
                <Text style={styles.tipsTitle}>💡 Tips</Text>
                <Text style={styles.tipItem}>• Don&apos;t forget to budget for utilities if not included</Text>
                <Text style={styles.tipItem}>• Factor in transportation costs to your workplace</Text>
                <Text style={styles.tipItem}>• Keep an emergency fund for unexpected expenses</Text>
                <Text style={styles.tipItem}>• Consider deposits (usually 2-3 months rent upfront)</Text>
              </View>
            </>
          )}

          {(!income || !expenses) && (
            <View style={styles.emptyState}>
              <Calculator size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>Enter Your Details</Text>
              <Text style={styles.emptyStateDesc}>
                Fill in your monthly income and expenses above to calculate how much rent you can
                afford.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

