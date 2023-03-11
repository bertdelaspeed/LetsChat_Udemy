import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
} from "react-native";
import React, {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthenticatedUserContext } from "../../Context/AuthenticationContext";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { chatRef, db } from "../../firebase/config";
import MessageItem from "../Components/MessageItem";
import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
const userAvatar = require("../../assets/man.png");
import axios from "axios";

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [message, setMessage] = useState("");
  const { friendName, friendAvatar, friendEmail } = route.params;
  const { user } = useContext(AuthenticatedUserContext);
  const sender = user.email.split("@")[0];
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);
  const [isListReady, setIsListReady] = useState(false);

  const queryResult = query(
    chatRef,
    where("chatters", "==", `${sender}xx${friendName}`)
  );
  const queryResult2 = query(
    chatRef,
    where("chatters", "==", `${friendName}xx${sender}`)
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View className="flex-row space-x-2 items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back-ios" size={30} color="orange" />
          </TouchableOpacity>
          {friendAvatar !== undefined ? (
            <Image
              source={{ uri: friendAvatar }}
              className="h-12 w-12 rounded-full mr-2"
            />
          ) : (
            <Image
              source={userAvatar}
              className="h-12 w-12 rounded-full mr-2"
            />
          )}
          <Text className="text-black font-bold tracking-widest text-lg">
            {friendName}
          </Text>
        </View>
      ),
    });
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      const querySnapshot = await getDocs(queryResult);
      const querySnapshot2 = await getDocs(queryResult2);
      if (!querySnapshot.empty || !querySnapshot2.empty) {
        let allMessages = querySnapshot.docs.map(
          (doc) => doc.data().conversation
        );
        allMessages = allMessages.concat(
          querySnapshot2.docs.map((doc) => doc.data().conversation)
        );
        allMessages = allMessages.sort(
          (a, b) => a.timestamp?.seconds - b.timestamp?.seconds
        );

        setMessages(allMessages);
      }
    };
    const unsub1 = onSnapshot(queryResult, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => doc.data().conversation);
      setMessages(allMessages);
    });
    const unsub2 = onSnapshot(queryResult2, (snapshot) => {
      const allMessages = snapshot.docs.map((doc) => doc.data().conversation);
      setMessages(allMessages);
    });

    fetchMessages();
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleSubmit = async () => {
    const querySnapshot = await getDocs(queryResult);
    const querySnapshot2 = await getDocs(queryResult2);

    if (!querySnapshot.empty || !querySnapshot2.empty) {
      querySnapshot.forEach((document) => {
        updateDoc(doc(db, "Chats", document.id), {
          conversation: [
            ...document.data().conversation,
            {
              message: message,
              timestamp: Timestamp.now(),
              sender: sender,
            },
          ],
        }).catch((error) => console.log(error));
      });

      querySnapshot2.forEach((document) => {
        updateDoc(doc(db, "Chats", document.id), {
          conversation: [
            ...document.data().conversation,
            {
              message: message,
              timestamp: Timestamp.now(),
              sender: sender,
            },
          ],
        }).catch((error) => console.log(error));
      });
    } else {
      await addDoc(collection(db, "Chats"), {
        chatters: `${sender}xx${friendName}`,
        conversation: [
          {
            message: message,
            timestamp: Timestamp.now(),
            sender: sender,
          },
        ],
      });
    }

    async function RetryRequest(maxRetries = 3) {
      let retries = 0;
      while (retries < maxRetries) {
        try {
          const response = await axios.post(
            `https://app.nativenotify.com/api/indie/notification`,
            {
              subID: `${friendEmail}`,
              appId: 6469,
              appToken: "zAbc4Qr227l0eSD1Cvpfo8",
              title: `${sender} - LetsChat`,
              message: `${message}`,
            }
          );

          console.log("notification success");
          return response;
        } catch (error) {
          console.log("request failed, retrying ...");
          retries++;
        }
      }
    }

    RetryRequest();
    setMessage("");
  };

  useEffect(() => {
    setIsListReady(true);
  }, [messages]);

  // console.log("messages = ", messages[0]);

  return (
    <View className="flex-1">
      {messages[0] !== undefined && (
        <View className="flex-1">
          <KeyboardAwareFlatList
            initialNumToRender={10}
            ref={flatListRef}
            onContentSizeChange={() => {
              if (isListReady) {
                flatListRef?.current?.scrollToEnd({ animated: true });
              }
            }}
            data={messages[0]}
            keyExtractor={(item) => item.timestamp}
            renderItem={({ item }) => (
              <MessageItem item={item} sender={sender} />
            )}
          />

          <View className="flex-row items-center mx-3 space-x-3 h-14 mb-2">
            <TextInput
              className="bg-white rounded-xl p-2 flex-1 text-gray-700 h-12"
              placeholder="Type your message here..."
              multiline={true}
              value={message}
              onChangeText={(text) => setMessage(text)}
            />
            <TouchableOpacity onPress={handleSubmit}>
              <MaterialCommunityIcons
                name="send-circle"
                size={40}
                color="orange"
                className="ml-4"
              />
            </TouchableOpacity>
          </View>
          {/* <StatusBar barStyle={"default"} /> */}
        </View>
      )}
    </View>
  );
};

export default ChatScreen;
