import { MaterialIcons } from "@expo/vector-icons";
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
} from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import path from "path";
import { getMediaType, MediaType } from "../utils/media";
import { ResizeMode, Video } from "expo-av";

type Media = {
  name: string;
  uri: string;
  type: MediaType;
};

// const clearFileSystem = async () => {
//    if (!FileSystem.documentDirectory) {
//      return;
//    }
//   try {
//     // List all files and directories
//     const files = await FileSystem.readDirectoryAsync(
//       FileSystem.documentDirectory
//     );

//     // Iterate and delete each file/directory
//     for (const file of files) {
//       const filePath = FileSystem.documentDirectory + file;
//       await FileSystem.deleteAsync(filePath, { idempotent: true });
//       console.log(`Deleted: ${filePath}`);
//     }

//     console.log("File system cleared.");
//   } catch (error) {
//     console.error("Error clearing file system:");
//   }
// };

export default function HomeScreen() {
  const [images, setImages] = useState<Media[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadfiles();
    }, [])
  );

  const loadfiles = async () => {
    if (!FileSystem.documentDirectory) {
      return;
    }

    const res = await FileSystem.readDirectoryAsync(
      FileSystem.documentDirectory
    );
    const imageExtensions = [".jpg", ".jpeg", ".png"];

    const filteredImages = res.filter((file) => {
      const extension = path.extname(file).toLowerCase();
      return imageExtensions.includes(extension);
    });

    setImages(
      filteredImages.map((file) => ({
        name: file,
        uri: FileSystem.documentDirectory + file,
        type: getMediaType(file),
      }))
    );
  };

  // console.log(JSON.stringify(images,null,2));

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={images}
        numColumns={3}
        contentContainerStyle={{ gap: 1 }}
        columnWrapperStyle={{ gap: 1 }}
        renderItem={({ item }) => (
          <Link href={`/${item.name}`} asChild>
            <Pressable style={{ flex: 1, maxWidth: "33.33%" }}>
              {item.type === "image" && (
                <Image
                  source={{ uri: item.uri }}
                  style={{ aspectRatio: 3 / 4, borderRadius: 5 }}
                />
              )}
              {item.type === "video" && (
                <>
                  <Video
                    source={{ uri: item.uri }}
                    style={{ aspectRatio: 3 / 4, borderRadius: 5 }}
                    resizeMode={ResizeMode.COVER}
                    positionMillis={100}
                    shouldPlay
                    isLooping
                  />
                  <MaterialIcons
                    name="play-circle-outline"
                    style={{ position: "absolute" }}
                    size={30}
                    color={"white"}
                  />
                </>
              )}
            </Pressable>
          </Link>
        )}
      />

      <Link href={"/camera"} asChild>
        <Pressable style={styles.floatingButton}>
          <MaterialIcons name="photo-camera" size={30} color="white" />
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    backgroundColor: "royalblue",
    padding: 15,
    borderRadius: 50,
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});
