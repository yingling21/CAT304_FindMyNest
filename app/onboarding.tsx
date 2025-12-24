import { useAuth } from "@/contexts/AuthContext";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { onboardingStyles as styles } from "@/styles/auth";

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
