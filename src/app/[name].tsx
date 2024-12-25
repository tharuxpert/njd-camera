import { Link, useLocalSearchParams, Stack, router } from "expo-router";
import { Image, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons";
import { getMediaType } from "../utils/media";
import { ResizeMode, Video } from "expo-av";
import { useVideoPlayer, VideoView } from "expo-video";
import * as MediaLibrary from "expo-media-library"

export default function ImageScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const [permissionResponse,requestPermissions] = MediaLibrary.usePermissions();
  
  const fullUri = (FileSystem.documentDirectory || "") + (name || "");
  const type = getMediaType(fullUri);

  const player = useVideoPlayer(fullUri, (player) => {
    player.loop = true;
    player.play();
  });

  const onDelete = async () => {
    await FileSystem.deleteAsync(fullUri);
    router.back();
  };

  const onSave = async() => {
    if (permissionResponse?.status !== "granted") {
      await requestPermissions();
    }
    const asset = await MediaLibrary.createAssetAsync(fullUri);
  }

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Stack.Screen
        options={{
          title: "Media",
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 5 }}>
              <MaterialIcons
                onPress={onDelete}
                name="delete"
                size={24}
                color="crimson"
              />
              <MaterialIcons
                onPress={onSave}
                name="save"
                size={24}
                color="dimgray"
              />
            </View>
          ),
        }}
      />

      {type === "image" && (
        <Image
          source={{ uri: fullUri }}
          style={{ width: "100%", height: "100%" }}
        />
      )}

      {type === "video" && (
        // <Video
        //   source={{ uri: fullUri }}
        //   style={{ width: "100%", height: "100%" }}
        //   resizeMode={ResizeMode.COVER}
        //   shouldPlay
        //   isLooping
        //   useNativeControls
        // />

        <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="cover" />
      )}
    </View>
  );
}
