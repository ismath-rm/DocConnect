import React from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { UserAPIwithAcess } from '../../Components/Api/Api';


function DoctorVideoCallRoom() {
  const { roomID } = useParams();
  const navigate = useNavigate();
  const accessToken = Cookies.get("access");
  const decoded = jwtDecode(accessToken);
  const userID = String(decoded.user_id);
  const userName = decoded.first_name;

  console.log(
    "this is the  authentication_user from redux store",
    userID,
    userName
  );

  const myMeeting = async (element) => {
    // generate Kit Token
    const appID = 659957452;
    const serverSecret = "e6d8104d69b68e69ada460315e94abf7";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName
    );

    const zc = ZegoUIKitPrebuilt.create(kitToken);
    zc.joinRoom({
      container: element,
      sharedLinks: [
        {
          name: "copy link",
          url:
            window.location.origin +
            "/room" +
            roomID,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.OneONoneCall,
      },
      showScreenSharingButton: true,
      turnOnMicrophoneWhenJoining: true,
      turnOnCameraWhenJoining: true,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,

      showTextChat: true,
      showUserList: true,
      maxUsers: 2,
      layout: "Auto",
      showLayoutButton: false,
      onLeaveRoom: async () => {
        try {
          console.log("Sending PATCH request to update order...");
          const response = await UserAPIwithAcess.patch(
            `appointment/update-order/${roomID}/`,
            {
              is_consultency_completed: 'COMPLETED',
            }
          );
          console.log("PATCH response:", response.data);
          navigate('/doctor/slot');
        } catch (error) {
          console.error("Failed to update transaction status", error);
        }
      },
    });
  };
  return (
    <div
      className="myCallContainer"
      ref={myMeeting}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}

export default DoctorVideoCallRoom;