import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { X, Calculator, TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import Slider from "@react-native-community/slider";

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 8,
  },
  hint: {
    fontSize: 13,
    fontWeight: "400" as const,
    color: "#9CA3AF",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  sliderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#6366F1",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  breakdownSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
  },
  breakdownTotal: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginTop: 8,
    paddingTop: 12,
  },
  breakdownTotalLabel: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#1F2937",
  },
  breakdownTotalValue: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#6366F1",
  },
  affordabilityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  affordabilityLow: {
    backgroundColor: "#FEF2F2",
  },
  affordabilityModerate: {
    backgroundColor: "#FFFBEB",
  },
  affordabilityGood: {
    backgroundColor: "#ECFDF5",
  },
  affordabilityText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500" as const,
    color: "#1F2937",
  },
  recommendationsSection: {
    marginBottom: 24,
  },
  recommendationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  comfortableCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  recommendedCard: {
    backgroundColor: "#EEF2FF",
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  maximumCard: {
    backgroundColor: "#FEF3F2",
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  recommendationAmount: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 4,
  },
  recommendationDesc: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  recommendationNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic" as const,
  },
  tipsSection: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#1F2937",
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#1F2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDesc: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});
