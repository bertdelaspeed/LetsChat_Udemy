import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import React, { useState } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
const backImage = require("../../assets/background_signup.jpg");
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { addDoc, collection } from "firebase/firestore";
import { processAuthError } from "../Utils";

const RegisterScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const onHandleRegister = () => {
    if (email !== "" && password !== "" && confirmPassword !== "") {
      if (password !== confirmPassword) {
        Alert.alert("Password does not match");
      } else {
        createUserWithEmailAndPassword(auth, email, password)
          .then(async (res) => {
            console.log("Result = ", res);
            await addDoc(collection(db, "Users"), {
              userId: res.user.uid,
              email: res.user.email,
              username: res.user.email.split("@")[0],
            });
          })
          .catch((error) => {
            processAuthError(error);
          });
      }
    }
  };

  //   console.log("email = ", email);
  return (
    <KeyboardAwareScrollView className="bg-black">
      <View>
        <Image source={backImage} className="object-cover h-80 w-full" />
      </View>
      <View className="bg-white h-screen rounded-t-3xl">
        <Text className="text-[#d60e45] text-3xl font-semibold text-center py-3 mt-3">
          Sign up{" "}
        </Text>
        <View className="items-center justify-center">
          <TextInput
            className="tracking-widest bg-gray-100 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5"
            placeholder="Enter Email"
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
          <TextInput
            className="tracking-widest bg-gray-100 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5"
            placeholder="Enter Password"
            secureTextEntry={true}
            autoCorrect={false}
            autoCapitalize="none"
            textContentType="password"
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          <TextInput
            className="tracking-widest bg-gray-100 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5"
            placeholder="Confirm Password"
            secureTextEntry={true}
            autoCorrect={false}
            autoCapitalize="none"
            textContentType="password"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
          />
        </View>
        <TouchableOpacity
          onPress={onHandleRegister}
          className="bg-[#fac25a] py-2 rounded-md mx-10 mb-3 mt-2"
        >
          <Text className="text-center font-semibold text-white text-lg">
            Register
          </Text>
        </TouchableOpacity>
        <View className="flex-row space-x-2 justify-center">
          <Text>Already have an account ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text className="text-[#d60e45] font-medium">Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* <StatusBar barStyle={"default"} /> */}
    </KeyboardAwareScrollView>
  );
};

export default RegisterScreen;
