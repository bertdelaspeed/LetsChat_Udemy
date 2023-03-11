import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { auth, chatRef, userRef } from "../../firebase/config";
const userAvatar = require("../../assets/man.png");
import { useNavigation } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons";
import { AuthenticatedUserContext } from "../../Context/AuthenticationContext";
import { getDocs, onSnapshot, query, where } from "firebase/firestore";
import { combinedData, sortLastMessage } from "../Utils";
import ChatItem from "../Components/ChatItem";

const HomeScreen = () => {
  const navigation = useNavigation();
  const { user, userAvatarUrl, setUserAvatarUrl } = useContext(
    AuthenticatedUserContext
  );
  const username = user.email.split("@")[0];
  const [friends, setFriends] = useState([]);
  const [friendAvatar, setFriendAvatar] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessage, setLastMessage] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          {!userAvatarUrl ? (
            <Image source={userAvatar} className="h-10 w-10" />
          ) : (
            <Image
              source={{ uri: userAvatarUrl }}
              className="h-10 w-10 rounded-full"
            />
          )}
        </TouchableOpacity>
      ),
    });
  }, [userAvatarUrl]);

  useEffect(() => {
    if (!user) return;
    const queryResult = query(userRef, where("email", "==", user.email));

    async function DocFinder(queryResult) {
      const querySnapshot = await getDocs(queryResult);
      querySnapshot.forEach((doc) => {
        const { profilePic } = doc.data();
        setUserAvatarUrl(profilePic);
      });
    }
    DocFinder(queryResult);
  }, []);

  useEffect(() => {
    if (!user) return;

    const FetchLoggedUserChats = async () => {
      setIsLoading(true);
      const queryResult = query(
        chatRef,
        where("chatters", ">=", `${username}`),
        where("chatters", "<=", `${username}` + "\uf8ff")
      );
      const queryResult2 = query(
        chatRef,
        where("chatters", "<=", `xx${username}`)
      );

      let friendsArray = [];

      const unsubscribe = onSnapshot(queryResult, (querySnapshot) => {
        setIsLoading(false);
        querySnapshot.forEach((doc) => {
          if (doc.data().chatters.includes(username)) {
            const chats = doc.data().chatters;
            const friends = chats.replace(username, "").replace("xx", "");
            friendsArray.push(friends);

            friendsArray = [...new Set(friendsArray)];
            setFriends(friendsArray);
          }
        });
      });
      const unsubscribe2 = onSnapshot(queryResult2, (querySnapshot) => {
        setIsLoading(false);
        querySnapshot.forEach((doc) => {
          if (doc.data().chatters.includes(username)) {
            const chats = doc.data().chatters;
            const friends = chats.replace(username, "").replace("xx", "");
            friendsArray.push(friends);

            friendsArray = [...new Set(friendsArray)];
            setFriends(friendsArray);
          }
        });
      });

      return () => {
        unsubscribe();
        unsubscribe2();
      };
    };
    FetchLoggedUserChats();
  }, []);

  // console.log("friends = ", friends);

  useEffect(() => {
    if (!user) return;

    let avatarsArray = [];
    let latestMessage = [];

    const unsubscribe = friends.map((friend) => {
      const queryResult = query(userRef, where("username", "==", friend));
      const unsubFriend = onSnapshot(queryResult, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const { profilePic, email } = doc.data();
          avatarsArray.push({ name: friend, avatar: profilePic, email: email });
          setFriendAvatar([...avatarsArray]);
        });
      });

      const queryResult2 = query(
        chatRef,
        where("chatters", "==", `${username}xx${friend}`)
      );
      const queryResult3 = query(
        chatRef,
        where("chatters", "==", `${friend}xx${username}`)
      );

      const unsubChat = onSnapshot(queryResult2, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const conversation = doc.data().conversation;
          let lastMessage = [];
          if (conversation && conversation.length > 0) {
            lastMessage = [conversation[conversation.length - 1]];
          }

          latestMessage.push({
            chatters: doc.data().chatters,
            message: lastMessage,
          });
          setLastMessage([...latestMessage]);
        });
      });

      const unsubChat2 = onSnapshot(queryResult3, (querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const conversation = doc.data().conversation;
          let lastMessage = [];
          if (conversation && conversation.length > 0) {
            lastMessage = [conversation[conversation.length - 1]];
          }

          latestMessage.push({
            chatters: doc.data().chatters,
            message: lastMessage,
          });
          setLastMessage([...latestMessage]);
        });
      });

      return () => {
        unsubFriend();
        unsubChat();
        unsubChat2();
      };
    });

    return () => unsubscribe.forEach((unsub) => unsub());
  }, [friends]);

  const sortedLastMessage = lastMessage.sort();

  const combData = combinedData(friendAvatar, sortedLastMessage);

  return (
    <>
      {isLoading ? (
        <View className="items-center justify-center h-full">
          <ActivityIndicator size="large" color="#D44A00" />
        </View>
      ) : (
        <FlatList
          data={combData}
          renderItem={({ item }) => (
            <ChatItem navigation={navigation} friend={item} />
          )}
        />
      )}
      <View className="flex-1">
        <View className=" flex-row-reverse absolute bottom-14 right-5">
          <TouchableOpacity
            onPress={() => navigation.navigate("Search")}
            className="bg-orange-500 h-16 w-16 rounded-full text-center items-center justify-center"
          >
            <Entypo name="chat" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default HomeScreen;
