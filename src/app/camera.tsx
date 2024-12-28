import {
  useCameraPermissions,
  CameraView,
  CameraType,
  CameraCapturedPicture,
} from "expo-camera";
import { Link, router } from "expo-router";
import { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
  Pressable,
  Image,
  Button,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import path from "path";
import * as FileSystem from "expo-file-system";
import { Video } from "expo-av";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const [facing, setFacing] = useState<CameraType>("back");
  const camera = useRef<CameraView>(null);
  const [picture, setPicture] = useState<CameraCapturedPicture>();
  const [isRecording, setIsRecording] = useState(false);
  const [video, setVideo] = useState<string>();

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const toggleCameraFacing = () => {
    setFacing((curr) => (curr === "back" ? "front" : "back"));
  };

  const onPress = () => {
    if (isRecording) {
      camera.current?.stopRecording();
    } else {
      takePicture();
    }
  };

  const takePicture = async () => {
    const res = await camera.current?.takePictureAsync();
    setPicture(res);
  };

  const startRecording = async () => {
    setIsRecording(true);
    const res = await camera.current?.recordAsync({ maxDuration: 60 });
    setVideo(res?.uri);
    setIsRecording(false);
  };

  const saveFile = async (uri: string) => {
    // save file
    const filename = path.parse(uri).base;

    await FileSystem.copyAsync({
      from: uri,
      to: FileSystem.documentDirectory + filename,
    });

    setPicture(undefined);
    setVideo(undefined);
    router.back();
  };

  if (!permission?.granted) {
    return <ActivityIndicator />;
  }

  if (picture || video) {
    return (
      <View style={{ flex: 1 }}>
        {picture && (
          <Image
            source={{ uri: picture.uri }}
            style={{ width: "100%", flex: 1 }}
          />
        )}
        {video && (
          <Video
            source={{ uri: video }}
            shouldPlay
            isLooping
            style={{ width: "100%", flex: 1 }}
          />
        )}
        <View style={{ padding: 10 }}>
          <SafeAreaView edges={["bottom"]}>
            <Button title="Save" onPress={() => saveFile(picture?.uri||video)} />
          </SafeAreaView>
        </View>
        <MaterialIcons
          onPress={() => {
            setPicture(undefined);
            setVideo(undefined);
          }}
          name="close"
          color={"white"}
          style={{ position: "absolute", top: 30, left: 30 }}
          size={30}
        />
      </View>
    );
  }

  return (
    <View>
      <CameraView
        ref={camera}
        // mode="video"
        style={styles.camera}
        facing={facing}
      >
        <View style={styles.footer}>
          <View />
          <Pressable
            style={[
              styles.recordButton,
              { backgroundColor: isRecording ? "crimson" : "white" },
            ]}
            onPress={onPress}
            onLongPress={startRecording}
          />
          <MaterialIcons
            name="flip-camera-android"
            size={24}
            color={"white"}
            onPress={toggleCameraFacing}
          />
        </View>
      </CameraView>

      <MaterialIcons
        name="close"
        color={"white"}
        style={styles.close}
        size={30}
        onPress={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  camera: {
    width: "100%",
    height: "100%",
  },
  footer: {
    marginTop: "auto",
    padding: 20,
    paddingBottom: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#00000099",
  },
  close: {
    position: "absolute",
    top: 30,
    left: 30,
  },
  recordButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "white",
  },
});
