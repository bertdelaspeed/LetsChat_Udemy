import { Image, StatusBar } from "react-native";
import LoginScreen from "./src/Screens/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RegisterScreen from "./src/Screens/RegisterScreen";
import AuthenticatedUserProvider, {
  AuthenticatedUserContext,
} from "./Context/AuthenticationContext";
import HomeScreen from "./src/Screens/HomeScreen";
import { useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import ProfileScreen from "./src/Screens/ProfileScreen";
import SearchScreen from "./src/Screens/SearchScreen";
import ChatScreen from "./src/Screens/ChatScreen";
const loadingGif = require("./assets/loading.gif");

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  return (
    <NavigationContainer>
      {!user && isLoading === true ? (
        <Image source={loadingGif} className="h-full w-full" />
      ) : !user && isLoading === false ? (
        <AuthStack />
      ) : (
        <MainStack />
      )}
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="LetsChat" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "" }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: "With whom " }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthenticatedUserProvider>
      <RootNavigator />
      <StatusBar barStyle={"default"} />
    </AuthenticatedUserProvider>
  );
}
