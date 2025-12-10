import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&q=80",
    title: "Find the perfect place for\nyour future house",
    subtitle: "Buy the best property that match your family\nand loved ones",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    title: "Fast rent your property in\njust one click",
    subtitle: "Simplify the property sales process with just one\nsmartphone",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800&q=80",
    title: "find your dream home\nwith us",
    subtitle: "just search and interact your landlord from\nproperty you want to secure",
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { completeOnboarding, skipOnboarding } = useAuth();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <View style={styles.imageContainer}>
              <View style={styles.imageCircle}>
                <Image source={{ uri: slide.image }} style={styles.image} contentFit="cover" />
              </View>
            </View>

            <View style={styles.textContainer}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>

            <View style={styles.pagination}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500" as const,
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  imageContainer: {
    width: width * 0.9,
    height: width * 0.9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  imageCircle: {
    width: width * 0.65,
    height: width * 0.65,
    borderRadius: (width * 0.65) / 2,
    overflow: "hidden",
    backgroundColor: "#E0E7FF",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textContainer: {
    alignItems: "center",
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "600" as const,
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 22,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
  },
  activeDot: {
    width: 24,
    backgroundColor: "#6366F1",
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: "#6366F1",
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600" as const,
  },
});
