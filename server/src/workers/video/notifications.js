import { Subscription } from "../../models/subscription.model.js";
import { Notification } from "../../models/notification.model.js";
import { redisPublisher } from "../../config/redis.js";

const notifySubscribersOfNewVideo = async ({ video, username }) => {
  const subscriptions = await Subscription.find({
    channel: video.owner,
  }).select("subscriber");

  for (const subscription of subscriptions) {
    const notification = await Notification.updateOne(
      {
        recipient: subscription.subscriber,
        sender: video.owner,
        type: "new_video",
        resourceId: video._id,
      },
      {
        $setOnInsert: {
          recipient: subscription.subscriber,
          sender: video.owner,
          type: "new_video",
          resourceId: video._id,
          message: `${username} uploaded a new video.`,
        },
      },
      { upsert: true }
    );

    // Publish only when a new notification was created.
    if (notification.upsertedCount > 0) {
      await redisPublisher.publish(
        "notifications",
        JSON.stringify({
          recipient: subscription.subscriber.toString(),
          notification: {
            sender: video.owner,
            type: "new_video",
            resourceId: video._id,
            message: `${username} uploaded a new video.`,
          },
        })
      );
    }

    console.log(`Subscriber notifications processed for video ${video._id}`);
  }
};

export { notifySubscribersOfNewVideo };
