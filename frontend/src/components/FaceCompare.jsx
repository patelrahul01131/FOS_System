import * as faceapi from "face-api.js";
import { useEffect } from "react";

export default function FaceCompare({ image1, image2 }) {
  useEffect(() => {
    const load = async () => {
      await faceapi.nets.ssdMobilenetv1.loadFromUri("/models");
      await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");

      const img1 = await faceapi.fetchImage(image1);
      const img2 = await faceapi.fetchImage(image2);

      const desc1 = await faceapi.detectSingleFace(img1).withFaceLandmarks().withFaceDescriptor();
      const desc2 = await faceapi.detectSingleFace(img2).withFaceLandmarks().withFaceDescriptor();

      const distance = faceapi.euclideanDistance(desc1.descriptor, desc2.descriptor);
      console.log("Face Match Score:", distance);
    };

    load();
  }, []);

  return <p>Face comparison running (check console)</p>;
}
