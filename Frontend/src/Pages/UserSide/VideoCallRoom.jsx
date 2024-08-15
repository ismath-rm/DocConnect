import React, { useRef, useEffect } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode"; // Correct import
import { useParams, useNavigate } from "react-router-dom";
import { UserAPIwithAcess } from '../../Components/Api/Api';
import axios from 'axios';

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
          console.error("Missing required parameters");
          return;
        }

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
              // navigate("/booking-details");
              // Update transaction status to COMPLETED
              const updateResponse = await UserAPIwithAcess.patch(
                `appointment/update-order/${roomID}/`,
                { is_consultency_completed: 'COMPLETED' }
              );

              console.log("Transaction status updated:", updateResponse.data);

              // Fetch the transaction details
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

              // Calculate commissions
              const doctorCommission = transaction.amount * 0.8; // 80% of amount
              const adminCommission = transaction.amount * 0.2; // 20% of amount

              // Prepare data for commission API
              const commissionData = {
                transaction: transaction.transaction_id,
                doctor_commission_amount: doctorCommission,
                commission_amount: adminCommission,
              };

              // Save the commissions to the database
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

              console.log("Commission saved:", commissionResponse.data);

              // Navigate to booking details page
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
