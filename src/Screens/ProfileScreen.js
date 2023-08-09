import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth, db, userRef } from "../../firebase/config";
import { AuthenticatedUserContext } from "../../Context/AuthenticationContext";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { ref, getStorage, uploadBytes, getDownloadURL } from "firebase/storage";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const storage = getStorage();
  const { user, setUser, setUserAvatarUrl } = useContext(
    AuthenticatedUserContext
  );

  const [username, setUsername] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userImageUrl, setUserImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const queryResult = query(userRef, where("email", "==", user.email));

  async function DocFinder(queryResult) {
    const querySnapshot = await getDocs(queryResult);
    querySnapshot.forEach((doc) => {
      if (username === "") {
        const { username, email, profilePic } = doc.data();
        setUsername(username);
        setUserEmail(email);
        setUserAvatarUrl(profilePic);
        setUserImageUrl(profilePic);
      }
    });
  }

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // console.log(result);

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (image) => {
    try {
      setIsLoading(true);
      const response = await fetch(image);
      // console.log("response = ", JSON.stringify(response));
      const blob = await response.blob();
      // console.log("blob = ", JSON.stringify(blob));
      const filename = image.substring(image.lastIndexOf("/"));
      // console.log("filename = ", filename);
      const imageRef = ref(storage, `ProfilePictures/${filename}`);
      uploadBytes(imageRef, blob).then(async () => {
        const downloadUrl = await getDownloadURL(imageRef);
        const querySnapshot = await getDocs(queryResult);
        querySnapshot.forEach(async (document) => {
          await updateDoc(doc(db, "Users", document.id), {
            profilePic: downloadUrl,
          }).then(() => {
            setUserImageUrl(downloadUrl);
            setUserAvatarUrl(downloadUrl);

            setIsLoading(false);
          });
        });
      });
    } catch (error) {
      Alert.alert(error.message);
      setIsLoading(false);
    }
  };

  // In case you're getting a response error while uploading your image
  // use the uploadImage method below instead (don't forget to uncomment it)

  // const uploadImage = async (image) => {
  //   try {
  //     setIsLoading(true);
  //     const blob = await new Promise((resolve, reject)=>{
  //       const xhr = new XMLHttpRequest()
  //       xhr.onload = function () {
  //         resolve(xhr.response)
  //       }
  //       xhr.onerror = function (e){
  //         reject(new TypeError("Network request failed"))
  //       }
  //       xhr.responseType = 'blob'
  //       xhr.open('GET', image, true)
  //       xhr.send(null)
  //     })
  //     // console.log("blob = ", JSON.stringify(blob));
  //     const filename = image.substring(image.lastIndexOf("/"));
  //     // console.log("filename = ", filename);
  //     const imageRef = ref(storage, `ProfilePictures/${filename}`);
  //     uploadBytes(imageRef, blob).then(async () => {
  //       const downloadUrl = await getDownloadURL(imageRef);
  //       const querySnapshot = await getDocs(queryResult);
  //       querySnapshot.forEach(async (document) => {
  //         await updateDoc(doc(db, "Users", document.id), {
  //           profilePic: downloadUrl,
  //         }).then(() => {
  //           setUserImageUrl(downloadUrl);
  //           setUserAvatarUrl(downloadUrl);

  //           setIsLoading(false);
  //         });
  //       });
  //     });
  //   } catch (error) {
  //     Alert.alert(error.message);
  //     setIsLoading(false);
  //   }
  // };

  useEffect(() => {
    if (!user) return;

    DocFinder(queryResult);
  }, [userImageUrl]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        navigation.navigate("Login");
      })
      .catch((error) => {
        Alert.alert(error.message);
      });
  };

  // console.log("user vatar =  ", userImageUrl);

  return (
    <View>
      <View className="justify-center items-center my-5">
        <Text className="text-2xl font-medium tracking-widest">
          Welcome , <Text className="text-[#d60e45]">{username}</Text>
        </Text>
      </View>
      <TouchableOpacity
        onPress={pickImage}
        className="rounded-md bg-gray-400 items-center justify-center mx-10 mb-10"
      >
        {userImageUrl === undefined ? (
          <Ionicons name="camera" size={50} color="white" />
        ) : isLoading ? (
          <ActivityIndicator size={"large"} color="white" />
        ) : (
          <Image
            source={{ uri: userImageUrl }}
            className="h-40 w-full rounded-md"
          />
        )}
      </TouchableOpacity>
      <View className="items-center justify-center">
        <Text className="tracking-widest bg-gray-200 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5 text-blue-900 font-light">
          {username}
        </Text>
        <Text className="tracking-widest bg-gray-200 rounded-lg w-80 text-base py-2 px-1 mx-3 mb-5 text-blue-900 font-light">
          {userEmail}
        </Text>
      </View>
      <View>
        <TouchableOpacity
          onPress={handleSignOut}
          className="bg-[#fac25a] py-2 rounded-md mx-20 mt-10 mb-3"
        >
          <Text className="text-center text-white font-semibold text-lg">
            Sign Out{" "}
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar barStyle={"default"} />
    </View>
  );
};

export default ProfileScreen;
