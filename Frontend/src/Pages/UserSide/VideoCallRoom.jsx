import { useRef, useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; 
import { useParams, useNavigate } from "react-router-dom";
import { UserAPIwithAcess } from '../../Components/Api/Api';


function VideoCallRoom() {
  const { roomID } = useParams();
  const navigate = useNavigate();
  const accessToken = Cookies.get("access");
  const decoded = jwtDecode(accessToken);
  const userID = String(decoded.user_id);
  const userName = decoded.first_name;

  const callContainerRef = useRef(null);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        if (!roomID || !userID || !userName) {
          console.error("Missing required parameters", { roomID, userID, userName });
          return;
        }

        const appID = 1103583712;
        const serverSecret = "2094914653d9d2520bb469b051f69377";
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          userID,
          userName
        );

        const zc = ZegoUIKitPrebuilt.create(kitToken);
        zc.joinRoom({
          container: callContainerRef.current,
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
            console.log("Leaving the room...");
            try {
              
              const updateResponse = await UserAPIwithAcess.patch(
                `appointment/update-order/${roomID}/`,
                { is_consultency_completed: 'COMPLETED' }
              );

              
              const transactionResponse = await UserAPIwithAcess.get(
                `appointment/geting/transaction/${roomID}/`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                }
              );

              const transaction = transactionResponse.data;

              
              const doctorCommission = transaction.amount * 0.8;
              const adminCommission = transaction.amount * 0.2; 


              const commissionData = {
                transaction: transaction.transaction_id,
                doctor_commission_amount: doctorCommission,
                commission_amount: adminCommission,
              };


              const commissionResponse = await UserAPIwithAcess.post(
                `appointment/transactionCommission/`,
                commissionData,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                }
              );
              
              navigate("/booking-details");

            } catch (error) {
              console.error("Error handling post-call operations:", error);
            }
          },
        });
      } catch (error) {
        console.error("Error initializing meeting:", error);
      }
    };

    initializeMeeting();
  }, [roomID, userID, userName, accessToken, navigate]);

  return (
    <div
      className="myCallContainer"
      ref={callContainerRef}
      style={{ width: "100vw", height: "100vh" }}
    ></div>
  );
}

export default VideoCallRoom;
