import React, { useState } from "react";
import { View, Button, Text, Platform, TouchableOpacity } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';

// 
// type DatePickerProps = {
//   value: Date;
//   onDateChange: (event: any, selectedDate?: Date) => void;
// };
// if only care about selectedDate, can simplify to:
type DatePickerProps = {
  value: Date;
  onDateChange: (selectedDate?: Date) => void;
};

export default function DatePicker({ value, onDateChange }: DatePickerProps) {
  const [show, setShow] = React.useState(false);

  const handleChange = (event: any, selectedDate?: Date) => {
    setShow(Platform.OS === 'ios');
    if (selectedDate) onDateChange(selectedDate);
  };

  return (
    <>
      <TouchableOpacity onPress={() => setShow(true)}>
        <Text>{value.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </>
  );
}
