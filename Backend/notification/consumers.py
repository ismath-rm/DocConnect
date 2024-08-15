# #consumers.py
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from account.models import Doctor
# from channels.db import database_sync_to_async

# class NotificationConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         self.custom_id = self.scope['url_route']['kwargs']['custom_id']
#         doctor = await self.get_doctor_instance()

#         if doctor:
#             self.room_group_name = f"notify_{doctor.custom_id}" 
#             await self.channel_layer.group_add(
#                 self.room_group_name,
#                 self.channel_name
#             )
#             await self.accept()
#             await self.send(text_data=json.dumps({
#                 'message': 'connected',
#             }))

#         else:
#             await self.close()

#     async def get_doctor_instance(self):
#         try:
#             return await database_sync_to_async(Doctor.objects.get)(custom_id=self.custom_id)
#         except Doctor.DoesNotExist:
#             return None
    
            

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(
#             self.room_group_name,
#             self.channel_name
#         )

#     async def receive(self, text_data):
#         await self.send(text_data=json.dumps({'status': 'OK'}))

#     async def send_notification(self, event):
#         print("+++send_notification")
#         data = json.loads(event.get('value'))
#         await self.send(text_data=json.dumps({
#                 'type' : 'notification',
#                 'payload': data,
#                 'notification_count': len(data),
#             }))
        
#     async def logout_user(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'logout'
#         }))



import json
from channels.generic.websocket import AsyncWebsocketConsumer
from account.models import Doctor, User  # Assuming you have a Patient model
from channels.db import database_sync_to_async

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.custom_id = self.scope['url_route']['kwargs']['custom_id']
        self.user_type = self.scope['url_route']['kwargs']['user_type']  # Added user_type to differentiate

        # Determine the room group name based on the user type
        print('this reach this consumer')
        print(self.user_type)
        if self.user_type == 'doctor':
            self.room_group_name = f"notify_doctor_{self.custom_id}"
            self.instance = await self.get_doctor_instance()
        elif self.user_type == 'patient':
            print('heyt this reach patient')
            self.room_group_name = f"notify_patient_{self.custom_id}"
            self.instance = await self.get_patient_instance()
        # else:
        #     await self.close()

        if self.instance:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            await self.send(text_data=json.dumps({
                'message': f'Connected as {self.user_type}',
            }))
        # else:
        #     await self.close()

    async def get_doctor_instance(self):
        try:
            return await database_sync_to_async(Doctor.objects.get)(custom_id=self.custom_id)
        except Doctor.DoesNotExist:
            return None

    async def get_patient_instance(self):
        try:
            return await database_sync_to_async(User.objects.get)(id=self.custom_id)
        except User.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        await self.send(text_data=json.dumps({'status': 'OK'}))

    async def send_notification(self, event):
        data = json.loads(event.get('value'))
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'payload': data,
            'notification_count': len(data),
        }))
        
    async def logout_user(self, event):
        await self.send(text_data=json.dumps({
            'type': 'logout'
        }))
