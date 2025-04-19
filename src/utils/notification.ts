export const playNotificationSound = () => {
  try {
    const audio = new Audio('/audio/notification.mp3');
    audio.play().catch(error => {
      console.error('Failed to play notification sound:', error);
    });
  } catch (error) {
    console.error('Error creating audio element:', error);
  }
};
