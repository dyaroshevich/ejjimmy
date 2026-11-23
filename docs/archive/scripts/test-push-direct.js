const webpush = require('web-push');
const VAPID_PUBLIC_KEY = "BMOvp5mdoVJtKnCBcFX72VO23TXLM0xGIltKi5GTjEh8jDS7TLPxxgW9Ba6hjr27K5jVhLYgJz7cJl8R_c4ZBMo";
const VAPID_PRIVATE_KEY = "CtWECd4rBXDsF9SZO8meTaI17cu5nim7JVDxfgk5zCo";
const VAPID_SUBJECT = "mailto:violstam23@gmail.com";

const sub = {
  endpoint: "https://fcm.googleapis.com/fcm/send/fxWKuIpfWcM:APA91bE2JfuX62Jvbxbf2QdDU1U4x0xKBfQyCNKwBkPWjfHcODB8GHsuUngVCrXqfiFE6RgtEWCXdBsx2Nj1lR3KguSNTxuHuVgBmgIeZ3yjxcOzkYEHmllzlPSADyvo8IphvKL-Nm3X",
  keys: {
    p256dh: "BKHuixGHumsVuRyogl8B-bVK0-1g1NBealcvzVWFO0ILksZj5Pe5yYGTveAhF7-CgOi244H6TosVJPjvgvmM38k",
    auth: "PwUYpwJvstDmogfzu2zRxQ"
  }
};

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

webpush.sendNotification(sub, JSON.stringify({ title: 'Test', body: 'Local test' }))
  .then(res => console.log('Success:', res.statusCode))
  .catch(err => console.error('Error:', err.statusCode, err.body));
